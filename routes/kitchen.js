const express = require('express');
const router = express.Router();
const models = require('../models');
const { requireAuth } = require('../middleware/auth');

// 厨房登录页面
router.get('/login', (req, res) => {
  res.render('login.html', { title: '厨房登录', role: 'kitchen' });
});

// 厨房订单队列
router.get('/queue', requireAuth(['kitchen']), async (req, res) => {
  try {
    const orders = await models.Order.findAll({
      where: {
        status: { [models.Sequelize.Op.in]: ['confirmed', 'preparing'] }
      },
      include: [
        { model: models.Table },
        { model: models.Member },
        { model: models.OrderItem, include: [{ model: models.Dish }] }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    res.render('kitchen/queue.html', {
      title: '厨房订单队列',
      user: req.session.user,
      orders: orders
    });
  } catch (error) {
    console.error('Kitchen queue error:', error);
    res.status(500).send('获取订单队列失败');
  }
});

// 更新订单状态
router.post('/order/:id/status', requireAuth(['kitchen']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await models.Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    await order.update({ status });
    
    res.json({ success: true, message: '订单状态更新成功' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: '更新订单状态失败' });
  }
});

module.exports = router;