const express = require('express');
const session = require('express-session');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const config = require('./config/app');

const app = express();

// 安全中间件
app.use(helmet());

// 限流中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 100次请求
});
app.use(limiter);

// 静态文件服务
app.use(express.static('public'));

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session配置
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // 生产环境设置为true
    maxAge: config.sessionTimeout 
  }
}));

// 设置模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 路由
app.use('/', require('./routes/index'));
app.use('/admin', require('./routes/admin'));
app.use('/kitchen', require('./routes/kitchen'));
app.use('/order', require('./routes/order'));
app.use('/api', require('./routes/api'));

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

// 404处理
app.use((req, res) => {
  res.status(404).send('页面未找到');
});

// 启动服务器
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`餐厅点餐系统启动成功！`);
  console.log(`管理后台: http://localhost:${PORT}/admin`);
  console.log(`厨房端: http://localhost:${PORT}/kitchen`);
  console.log(`点餐端: http://localhost:${PORT}`);
});

// 数据库连接测试
sequelize.authenticate()
  .then(() => {
    console.log('数据库连接成功');
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
  });

module.exports = app;