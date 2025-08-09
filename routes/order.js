const express = require('express');
const router = express.Router();
const models = require('../models');

// 选择餐桌
router.get('/tables', async (req, res) => {
  try {
    const tables = await models.Table.findAll({
      where: { isActive: true },
      order: [['number', 'ASC']]
    });
    
    res.render('order/tables.html', {
      title: '选择餐桌',
      tables: tables
    });
  } catch (error) {
    console.error('Tables error:', error);
    res.status(500).send('获取餐桌列表失败');
  }
});

// 菜单页面
router.get('/menu', async (req, res) => {
  try {
    const tableId = req.query.tableId;
    if (!tableId) {
      return res.redirect('/order/tables');
    }
    
    const table = await models.Table.findByPk(tableId);
    if (!table) {
      return res.status(404).send('餐桌不存在');
    }
    
    const categories = await models.Category.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']]
    });
    
    const dishes = await models.Dish.findAll({
      where: { isActive: true },
      include: [{ model: models.Category }],
      order: [['createdAt', 'DESC']]
    });
    
    res.render('order/menu.html', {
      title: '菜单',
      table: table,
      categories: categories,
      dishes: dishes
    });
  } catch (error) {
    console.error('Menu error:', error);
    res.status(500).send('获取菜单失败');
  }
});

// 结账页面
router.get('/checkout', async (req, res) => {
  try {
    const tableId = req.query.tableId;
    if (!tableId) {
      return res.redirect('/order/tables');
    }
    
    const table = await models.Table.findByPk(tableId);
    if (!table) {
      return res.status(404).send('餐桌不存在');
    }
    
    res.render('order/checkout.html', {
      title: '结账',
      table: table
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).send('获取结账页面失败');
  }
});

// 会员登录
router.post('/member-login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    const member = await models.Member.findOne({
      where: { phone, isActive: true }
    });
    
    if (!member) {
      return res.status(404).json({ error: '会员不存在' });
    }
    
    if (member.password && member.password !== password) {
      return res.status(401).json({ error: '密码错误' });
    }
    
    req.session.member = member.get({ plain: true });
    
    res.json({ 
      success: true, 
      member: member.get({ plain: true }) 
    });
  } catch (error) {
    console.error('Member login error:', error);
    res.status(500).json({ error: '会员登录失败' });
  }
});

// 游客模式
router.post('/guest-mode', (req, res) => {
  req.session.member = null;
  res.json({ success: true });
});

module.exports = router;