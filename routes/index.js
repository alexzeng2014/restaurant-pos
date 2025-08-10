const express = require('express');
const router = express.Router();
const models = require('../models');
const { requireAuth, requireGuest } = require('../middleware/auth');

// 主页 - 重定向到点餐页面
router.get('/', (req, res) => {
  res.redirect('/order/tables');
});

// 登录页面
router.get('/login', requireGuest, (req, res) => {
  res.render('login.ejs', { title: '登录', role: null });
});

// 登录处理
router.post('/login', requireGuest, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await models.SystemUser.findOne({
      where: { username, isActive: true }
    });
    
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    const isValidPassword = await require('../middleware/auth').comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    req.session.user = user.get({ plain: true });
    
    if (user.role === 'admin') {
      return res.json({ success: true, redirect: '/admin' });
    } else if (user.role === 'kitchen') {
      return res.json({ success: true, redirect: '/kitchen' });
    }
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// 登出
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;