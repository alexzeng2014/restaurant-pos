@echo off
chcp 65001 >nul
title 餐厅点餐系统 - 一键安装脚本

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                餐厅点餐系统 - 一键安装脚本                     ║
echo ║                      Windows 版本                             ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: 检查Node.js是否安装
echo 🔍 检查系统环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未检测到 Node.js
    echo.
    echo 请先安装 Node.js 18 或更高版本
    echo 下载地址：https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js 环境检查通过

:: 检查当前目录
echo 📁 检查安装目录...
if not exist "package.json" (
    echo ❌ 错误：请在项目根目录运行此脚本
    echo.
    pause
    exit /b 1
)

echo ✅ 安装目录确认

:: 安装依赖
echo.
echo 📦 安装依赖包...
call npm install --production
if errorlevel 1 (
    echo ❌ 依赖包安装失败
    echo.
    pause
    exit /b 1
)
echo ✅ 依赖包安装完成

:: 初始化数据库
echo.
echo 🗄️  初始化数据库...
node setup.js
if errorlevel 1 (
    echo ❌ 数据库初始化失败
    echo.
    pause
    exit /b 1
)
echo ✅ 数据库初始化完成

:: 创建必要的目录
echo.
echo 📂 创建系统目录...
if not exist "logs" mkdir logs
if not exist "backup" mkdir backup
if not exist "public\uploads" mkdir public\uploads
echo ✅ 系统目录创建完成

:: 安装Windows服务（可选）
echo.
echo 🔧 是否安装为Windows服务？
echo 安装后系统会自动启动，无需手动运行
echo.
set /p install_service="请选择 (Y/N): "
if /i "%install_service%"=="Y" (
    echo.
    echo 🚀 安装Windows服务...
    
    :: 检查node-windows是否已安装
    npm list node-windows >nul 2>&1
    if errorlevel 1 (
        echo 📦 安装node-windows...
        call npm install node-windows --save
        if errorlevel 1 (
            echo ❌ node-windows 安装失败
            echo.
            pause
            exit /b 1
        )
    )
    
    :: 安装服务
    node install-service.js
    if errorlevel 1 (
        echo ❌ Windows服务安装失败
        echo.
        pause
        exit /b 1
    )
    
    echo ✅ Windows服务安装完成
) else (
    echo ⏭️  跳过Windows服务安装
)

:: 创建桌面快捷方式（可选）
echo.
echo 🖥️  是否创建桌面快捷方式？
set /p create_shortcut="请选择 (Y/N): "
if /i "%create_shortcut%"=="Y" (
    echo 📝 创建桌面快捷方式...
    
    :: 创建VBS脚本来创建快捷方式
    echo Set WshShell = WScript.CreateObject("WScript.Shell") > %temp%\create_shortcut.vbs
    echo strDesktop = WshShell.SpecialFolders("Desktop") >> %temp%\create_shortcut.vbs
    echo set oShellLink = WshShell.CreateShortcut(strDesktop ^& "\餐厅点餐系统.lnk") >> %temp%\create_shortcut.vbs
    echo oShellLink.TargetPath = "%~dp0app.js" >> %temp%\create_shortcut.vbs
    echo oShellLink.WorkingDirectory = "%~dp0" >> %temp%\create_shortcut.vbs
    echo oShellLink.WindowStyle = 1 >> %temp%\create_shortcut.vbs
    echo oShellLink.Description = "餐厅点餐系统" >> %temp%\create_shortcut.vbs
    echo oShellLink.IconLocation = "%~dp0public\images\icon.ico, 0" >> %temp%\create_shortcut.vbs
    echo oShellLink.Save >> %temp%\create_shortcut.vbs
    
    cscript //nologo %temp%\create_shortcut.vbs
    del %temp%\create_shortcut.vbs
    
    echo ✅ 桌面快捷方式创建完成
) else (
    echo ⏭️  跳过桌面快捷方式创建
)

:: 创建配置文件
echo.
echo ⚙️  创建配置文件...
echo { > config.json
echo   "installed": true, >> config.json
echo   "installDate": "%date% %time%", >> config.json
echo   "version": "1.0.0" >> config.json
echo } >> config.json
echo ✅ 配置文件创建完成

:: 显示安装完成信息
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    安装完成！                                ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🌐 访问地址：
echo    管理后台: http://localhost:3000/admin
echo    厨房端: http://localhost:3000/kitchen
echo    点餐端: http://localhost:3000
echo.
echo 🔑 默认账号：
echo    管理员: admin / admin123
echo    厨房: kitchen / kitchen123
echo.
echo 📚 使用说明：
echo    1. 管理员后台可以管理菜品、会员、订单等
echo    2. 厨房端可以查看和处理订单
echo    3. 顾客可以通过浏览器访问点餐端进行点餐
echo.
echo 🛠️  管理命令：
echo    启动服务: net start RestaurantPOS
echo    停止服务: net stop RestaurantPOS
echo    卸载服务: node uninstall-service.js
echo    手动启动: node app.js
echo.
echo 📁 安装目录: %~dp0
echo.

:: 询问是否立即启动
set /p start_now="是否立即启动系统？(Y/N): "
if /i "%start_now%"=="Y" (
    if /i "%install_service%"=="Y" (
        echo 🚀 启动Windows服务...
        net start RestaurantPOS
    ) else (
        echo 🚀 手动启动应用程序...
        start node app.js
    )
    echo ✅ 系统启动完成
    echo 请等待几秒后访问上述地址
) else (
    echo ⏸️  系统已安装完成，可以稍后手动启动
)

echo.
echo 🎉 感谢使用餐厅点餐系统！
echo.
pause