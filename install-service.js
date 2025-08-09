const Service = require('node-windows').Service;
const path = require('path');

// 创建Windows服务
const svc = new Service({
  name: 'RestaurantPOS',
  description: '餐厅点餐系统服务',
  script: path.join(__dirname, 'app.js'),
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ],
  env: {
    name: 'NODE_ENV',
    value: 'production'
  }
});

// 监听安装事件
svc.on('install', () => {
  console.log('✅ 服务安装完成！');
  
  // 启动服务
  svc.start();
  
  console.log('🚀 服务已启动！');
  console.log('');
  console.log('📋 服务信息：');
  console.log('服务名称: RestaurantPOS');
  console.log('描述: 餐厅点餐系统服务');
  console.log('');
  console.log('🌐 访问地址：');
  console.log('管理后台: http://localhost:3000/admin');
  console.log('厨房端: http://localhost:3000/kitchen');
  console.log('点餐端: http://localhost:3000');
  console.log('');
  console.log('🔑 默认账号：');
  console.log('管理员: admin / admin123');
  console.log('厨房: kitchen / kitchen123');
});

// 监听启动事件
svc.on('start', () => {
  console.log('✅ 服务启动成功！');
  console.log('📝 服务运行在 http://localhost:3000');
});

// 监听错误事件
svc.on('error', (err) => {
  console.error('❌ 服务安装失败:', err);
});

// 安装服务
svc.install();