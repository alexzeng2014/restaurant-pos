const Service = require('node-windows').Service;

// 创建Windows服务
const svc = new Service({
  name: 'RestaurantPOS',
  description: '餐厅点餐系统服务',
  script: require('path').join(__dirname, 'app.js')
});

// 监听卸载事件
svc.on('uninstall', () => {
  console.log('✅ 服务卸载完成！');
  console.log('🔄 餐厅点餐系统服务已成功移除');
});

// 卸载服务
svc.uninstall();