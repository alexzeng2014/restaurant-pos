const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');
const models = require('./models');
const bcrypt = require('bcryptjs');
const config = require('./config/app');

// 数据库初始化脚本
async function initializeDatabase() {
    try {
        console.log('开始初始化数据库...');
        
        // 同步数据库结构
        await sequelize.sync({ force: true });
        console.log('数据库表结构创建完成');
        
        // 创建默认管理员账号
        const adminPassword = await bcrypt.hash(config.defaultAdmin.password, 10);
        await models.SystemUser.create({
            username: config.defaultAdmin.username,
            password: adminPassword,
            role: 'admin',
            name: '系统管理员'
        });
        console.log('默认管理员账号创建完成');
        
        // 创建默认厨房账号
        const kitchenPassword = await bcrypt.hash(config.defaultKitchen.password, 10);
        await models.SystemUser.create({
            username: config.defaultKitchen.username,
            password: kitchenPassword,
            role: 'kitchen',
            name: '厨房管理员'
        });
        console.log('默认厨房账号创建完成');
        
        // 创建默认分类
        const categories = await models.Category.bulkCreate([
            { name: '热菜', description: '主菜类热菜', sortOrder: 1 },
            { name: '凉菜', description: '凉拌菜类', sortOrder: 2 },
            { name: '汤类', description: '各种汤品', sortOrder: 3 },
            { name: '主食', description: '米饭面条等', sortOrder: 4 },
            { name: '饮料', description: '酒水饮料', sortOrder: 5 },
            { name: '小吃', description: '特色小吃', sortOrder: 6 }
        ]);
        console.log('默认分类创建完成');
        
        // 创建默认餐桌
        const tables = [];
        for (let i = 1; i <= 20; i++) {
            tables.push({
                number: i.toString(),
                name: `${i}号桌`,
                capacity: 4,
                area: i <= 10 ? '大厅' : '包间'
            });
        }
        await models.Table.bulkCreate(tables);
        console.log('默认餐桌创建完成');
        
        // 创建示例菜品
        const dishes = [
            {
                name: '宫保鸡丁',
                description: '经典川菜，鸡肉配花生米，口感丰富',
                price: 28.00,
                memberPrice: 25.00,
                isSpecial: true,
                stock: -1
            },
            {
                name: '麻婆豆腐',
                description: '四川传统名菜，麻辣鲜香',
                price: 18.00,
                memberPrice: 16.00,
                isSpecial: false,
                stock: -1
            },
            {
                name: '红烧肉',
                description: '传统家常菜，肥而不腻，入口即化',
                price: 35.00,
                memberPrice: 32.00,
                isSpecial: true,
                stock: -1
            },
            {
                name: '西红柿鸡蛋',
                description: '家常菜，营养丰富，老少皆宜',
                price: 15.00,
                memberPrice: 13.00,
                isSpecial: false,
                stock: -1
            },
            {
                name: '酸辣土豆丝',
                description: '爽脆可口，酸辣开胃',
                price: 12.00,
                memberPrice: 10.00,
                isSpecial: false,
                stock: -1
            },
            {
                name: '紫菜蛋花汤',
                description: '清淡营养，老少皆宜',
                price: 8.00,
                memberPrice: 7.00,
                isSpecial: false,
                stock: -1
            },
            {
                name: '米饭',
                description: '优质东北大米',
                price: 2.00,
                memberPrice: 1.50,
                isSpecial: false,
                stock: -1
            },
            {
                name: '可乐',
                description: '冰镇可口可乐',
                price: 5.00,
                memberPrice: 4.50,
                isSpecial: false,
                stock: 50
            },
            {
                name: '雪花啤酒',
                description: '冰镇雪花啤酒',
                price: 8.00,
                memberPrice: 7.00,
                isSpecial: false,
                stock: 30
            },
            {
                name: '春卷',
                description: '传统小吃，外酥里嫩',
                price: 6.00,
                memberPrice: 5.00,
                isSpecial: false,
                stock: 20
            }
        ];
        
        const createdDishes = await models.Dish.bulkCreate(dishes);
        console.log('示例菜品创建完成');
        
        // 关联菜品和分类
        const dishCategories = [
            { dishId: createdDishes[0].id, categoryId: categories[0].id }, // 宫保鸡丁 - 热菜
            { dishId: createdDishes[1].id, categoryId: categories[0].id }, // 麻婆豆腐 - 热菜
            { dishId: createdDishes[2].id, categoryId: categories[0].id }, // 红烧肉 - 热菜
            { dishId: createdDishes[3].id, categoryId: categories[0].id }, // 西红柿鸡蛋 - 热菜
            { dishId: createdDishes[4].id, categoryId: categories[1].id }, // 酸辣土豆丝 - 凉菜
            { dishId: createdDishes[5].id, categoryId: categories[2].id }, // 紫菜蛋花汤 - 汤类
            { dishId: createdDishes[6].id, categoryId: categories[3].id }, // 米饭 - 主食
            { dishId: createdDishes[7].id, categoryId: categories[4].id }, // 可乐 - 饮料
            { dishId: createdDishes[8].id, categoryId: categories[4].id }, // 雪花啤酒 - 饮料
            { dishId: createdDishes[9].id, categoryId: categories[5].id }  // 春卷 - 小吃
        ];
        
        await models.DishCategory.bulkCreate(dishCategories);
        console.log('菜品分类关联完成');
        
        // 创建示例会员
        const sampleMembers = [
            {
                phone: '13800138000',
                name: '张三',
                password: '123456',
                balance: 100.00,
                points: 100,
                level: 'silver'
            },
            {
                phone: '13800138001',
                name: '李四',
                password: '123456',
                balance: 200.00,
                points: 200,
                level: 'gold'
            },
            {
                phone: '13800138002',
                name: '王五',
                password: '123456',
                balance: 50.00,
                points: 50,
                level: 'bronze'
            }
        ];
        
        await models.Member.bulkCreate(sampleMembers);
        console.log('示例会员创建完成');
        
        // 创建示例充值记录
        const rechargeRecords = [
            {
                memberId: 1,
                amount: 100.00,
                beforeBalance: 0.00,
                afterBalance: 100.00,
                paymentMethod: 'cash',
                remark: '初始充值'
            },
            {
                memberId: 2,
                amount: 200.00,
                beforeBalance: 0.00,
                afterBalance: 200.00,
                paymentMethod: 'wechat',
                remark: '初始充值'
            },
            {
                memberId: 3,
                amount: 50.00,
                beforeBalance: 0.00,
                afterBalance: 50.00,
                paymentMethod: 'alipay',
                remark: '初始充值'
            }
        ];
        
        await models.RechargeRecord.bulkCreate(rechargeRecords);
        console.log('示例充值记录创建完成');
        
        console.log('✅ 数据库初始化完成！');
        console.log('');
        console.log('📋 默认账号信息：');
        console.log('管理员：admin / admin123');
        console.log('厨房：kitchen / kitchen123');
        console.log('');
        console.log('📊 系统信息：');
        console.log('- 创建了 6 个菜品分类');
        console.log('- 创建了 20 张餐桌');
        console.log('- 创建了 10 道示例菜品');
        console.log('- 创建了 3 个示例会员');
        console.log('');
        console.log('🚀 现在可以启动系统了！');
        
        process.exit(0);
        
    } catch (error) {
        console.error('数据库初始化失败:', error);
        process.exit(1);
    }
}

// 检查数据库是否已初始化
async function checkDatabaseInitialized() {
    try {
        await models.SystemUser.findOne();
        return true;
    } catch (error) {
        return false;
    }
}

// 主函数
async function main() {
    console.log('🔧 餐厅点餐系统数据库初始化工具');
    console.log('=====================================');
    
    const isInitialized = await checkDatabaseInitialized();
    
    if (isInitialized) {
        console.log('⚠️  数据库已经初始化过！');
        console.log('如果需要重新初始化，请删除 database.db 文件后重试');
        process.exit(1);
    }
    
    console.log('🚀 开始初始化数据库...');
    await initializeDatabase();
}

// 运行主函数
main();