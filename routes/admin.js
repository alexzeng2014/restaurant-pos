const express = require('express');
const router = express.Router();
const models = require('../models');
const { requireAuth, requireGuest } = require('../middleware/auth');
const { Op } = models.Sequelize;

// 管理员根路由 - 重定向到仪表板或登录页面
router.get('/', (req, res) => {
  if (req.session.user && req.session.user.role === 'admin') {
    res.redirect('/admin/dashboard');
  } else {
    res.redirect('/admin/login');
  }
});

// 管理员登录页面
router.get('/login', requireGuest, (req, res) => {
  res.render('login.ejs', { title: '管理员登录', role: 'admin' });
});

// 管理员仪表板
router.get('/dashboard', requireAuth(['admin']), async (req, res) => {
  try {
    // 今日统计
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStats = await models.Order.findAll({
      where: {
        createdAt: { [Op.gte]: today },
        status: { [Op.ne]: 'cancelled' }
      },
      attributes: [
        [models.Sequelize.fn('COUNT', models.Sequelize.col('id')), 'orderCount'],
        [models.Sequelize.fn('SUM', models.Sequelize.col('finalAmount')), 'totalAmount']
      ],
      raw: true
    });

    // 会员统计
    const memberStats = await models.Member.findAll({
      where: { isActive: true },
      attributes: [
        [models.Sequelize.fn('COUNT', models.Sequelize.col('id')), 'totalMembers'],
        [models.Sequelize.fn('SUM', models.Sequelize.col('balance')), 'totalBalance']
      ],
      raw: true
    });

    // 热销菜品
    const topDishes = await models.OrderItem.findAll({
      include: [{ model: models.Dish, attributes: ['name'] }],
      attributes: [
        'dishId',
        [models.Sequelize.fn('SUM', models.Sequelize.col('quantity')), 'totalQuantity']
      ],
      group: ['dishId', 'Dish.id'],
      order: [[models.Sequelize.fn('SUM', models.Sequelize.col('quantity')), 'DESC']],
      limit: 10,
      raw: true
    });

    res.render('admin/dashboard.ejs', {
      title: '管理员仪表板',
      user: req.session.user,
      req: req,
      todayStats: todayStats[0] || { orderCount: 0, totalAmount: 0 },
      memberStats: memberStats[0] || { totalMembers: 0, totalBalance: 0 },
      topDishes: topDishes
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('获取统计数据失败');
  }
});

// 会员管理
router.get('/members', requireAuth(['admin']), async (req, res) => {
  try {
    const members = await models.Member.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });
    
    res.render('admin/members.ejs', {
      title: '会员管理',
      user: req.session.user,
      req: req,
      members: members
    });
  } catch (error) {
    console.error('Members error:', error);
    res.status(500).send('获取会员列表失败');
  }
});

// 会员充值页面
router.get('/member-recharge', requireAuth(['admin']), (req, res) => {
  res.render('admin/member-recharge.ejs', {
    title: '会员充值',
    user: req.session.user,
    req: req
  });
});

// 菜品管理
router.get('/dishes', requireAuth(['admin']), async (req, res) => {
  try {
    const dishes = await models.Dish.findAll({
      include: [{ model: models.Category }],
      order: [['createdAt', 'DESC']]
    });
    
    const categories = await models.Category.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']]
    });
    
    res.render('admin/dishes.ejs', {
      title: '菜品管理',
      user: req.session.user,
      req: req,
      dishes: dishes,
      categories: categories
    });
  } catch (error) {
    console.error('Dishes error:', error);
    res.status(500).send('获取菜品列表失败');
  }
});

// 分类管理
router.get('/categories', requireAuth(['admin']), async (req, res) => {
  try {
    const categories = await models.Category.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']]
    });
    
    res.render('admin/categories.ejs', {
      title: '分类管理',
      user: req.session.user,
      req: req,
      categories: categories
    });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).send('获取分类列表失败');
  }
});

// 订单管理
router.get('/orders', requireAuth(['admin']), async (req, res) => {
  try {
    const orders = await models.Order.findAll({
      include: [
        { model: models.Member },
        { model: models.Table },
        { model: models.OrderItem, include: [{ model: models.Dish }] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.render('admin/orders.ejs', {
      title: '订单管理',
      user: req.session.user,
      req: req,
      orders: orders
    });
  } catch (error) {
    console.error('Orders error:', error);
    res.status(500).send('获取订单列表失败');
  }
});

module.exports = router;