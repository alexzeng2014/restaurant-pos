const express = require('express');
const router = express.Router();
const models = require('../models');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// 会员管理API
router.get('/members', requireAuth(['admin']), async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = { isActive: true };
    
    if (search) {
      whereClause[models.Sequelize.Op.or] = [
        { phone: { [models.Sequelize.Op.like]: `%${search}%` } },
        { name: { [models.Sequelize.Op.like]: `%${search}%` } }
      ];
    }
    
    const members = await models.Member.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    
    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: '获取会员列表失败' });
  }
});

// 创建会员
router.post('/members', requireAuth(['admin']), async (req, res) => {
  try {
    const { phone, name, password, balance } = req.body;
    
    const existingMember = await models.Member.findOne({ where: { phone } });
    if (existingMember) {
      return res.status(400).json({ error: '手机号已存在' });
    }
    
    const member = await models.Member.create({
      phone,
      name,
      password,
      balance: balance || 0,
      createdBy: req.session.user.id
    });
    
    res.json({ success: true, member });
  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({ error: '创建会员失败' });
  }
});

// 会员充值
router.post('/members/:id/recharge', requireAuth(['admin']), async (req, res) => {
  const t = await models.sequelize.transaction();
  try {
    const { id } = req.params;
    const { amount, paymentMethod, remark } = req.body;
    
    const member = await models.Member.findByPk(id, { transaction: t });
    if (!member) {
      await t.rollback();
      return res.status(404).json({ error: '会员不存在' });
    }
    
    const beforeBalance = member.balance;
    const afterBalance = beforeBalance + parseFloat(amount);
    
    // 更新会员余额
    await member.update({
      balance: afterBalance,
      totalRecharged: member.totalRecharged + parseFloat(amount)
    }, { transaction: t });
    
    // 记录充值历史
    await models.RechargeRecord.create({
      memberId: id,
      amount: parseFloat(amount),
      beforeBalance,
      afterBalance,
      operatorId: req.session.user.id,
      paymentMethod: paymentMethod || 'cash',
      remark
    }, { transaction: t });
    
    await t.commit();
    
    res.json({ 
      success: true, 
      message: '充值成功',
      newBalance: afterBalance 
    });
  } catch (error) {
    await t.rollback();
    console.error('Member recharge error:', error);
    res.status(500).json({ error: '充值失败' });
  }
});

// 菜品管理API
router.get('/dishes', async (req, res) => {
  try {
    const dishes = await models.Dish.findAll({
      include: [{ model: models.Category }],
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(dishes);
  } catch (error) {
    console.error('Get dishes error:', error);
    res.status(500).json({ error: '获取菜品列表失败' });
  }
});

// 创建菜品
router.post('/dishes', requireAuth(['admin']), upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, memberPrice, categoryId, isSpecial } = req.body;
    
    const dish = await models.Dish.create({
      name,
      description,
      price: parseFloat(price),
      memberPrice: parseFloat(memberPrice),
      image: req.file ? `/uploads/${req.file.filename}` : null,
      isSpecial: isSpecial === 'true'
    });
    
    // 关联分类
    if (categoryId) {
      await models.DishCategory.create({
        dishId: dish.id,
        categoryId: parseInt(categoryId)
      });
    }
    
    res.json({ success: true, dish });
  } catch (error) {
    console.error('Create dish error:', error);
    res.status(500).json({ error: '创建菜品失败' });
  }
});

// 更新菜品
router.put('/dishes/:id', requireAuth(['admin']), upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, memberPrice, categoryId, isSpecial } = req.body;
    
    const dish = await models.Dish.findByPk(id);
    if (!dish) {
      return res.status(404).json({ error: '菜品不存在' });
    }
    
    const updateData = {
      name,
      description,
      price: parseFloat(price),
      memberPrice: parseFloat(memberPrice),
      isSpecial: isSpecial === 'true'
    };
    
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    
    await dish.update(updateData);
    
    // 更新分类关联
    if (categoryId) {
      await models.DishCategory.destroy({ where: { dishId: id } });
      await models.DishCategory.create({
        dishId: id,
        categoryId: parseInt(categoryId)
      });
    }
    
    res.json({ success: true, dish });
  } catch (error) {
    console.error('Update dish error:', error);
    res.status(500).json({ error: '更新菜品失败' });
  }
});

// 删除菜品
router.delete('/dishes/:id', requireAuth(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const dish = await models.Dish.findByPk(id);
    if (!dish) {
      return res.status(404).json({ error: '菜品不存在' });
    }
    
    await dish.update({ isActive: false });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete dish error:', error);
    res.status(500).json({ error: '删除菜品失败' });
  }
});

// 分类管理API
router.get('/categories', async (req, res) => {
  try {
    const categories = await models.Category.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']]
    });
    
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: '获取分类列表失败' });
  }
});

// 创建分类
router.post('/categories', requireAuth(['admin']), async (req, res) => {
  try {
    const { name, description, sortOrder } = req.body;
    
    const category = await models.Category.create({
      name,
      description,
      sortOrder: parseInt(sortOrder) || 0
    });
    
    res.json({ success: true, category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: '创建分类失败' });
  }
});

// 创建订单
router.post('/orders', async (req, res) => {
  const t = await models.sequelize.transaction();
  try {
    const { tableId, memberId, items, notes, paymentMethod, balanceUsed } = req.body;
    
    // 生成订单号
    const orderNumber = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
    
    // 计算总价
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.quantity;
    }
    
    const finalAmount = subtotal; // 可以添加折扣逻辑
    
    // 创建订单
    const order = await models.Order.create({
      orderNumber,
      tableId: parseInt(tableId),
      memberId: memberId || null,
      status: 'pending',
      subtotal,
      discount: 0,
      finalAmount,
      paymentMethod: paymentMethod || 'cash',
      balanceUsed: balanceUsed || 0,
      cashAmount: finalAmount - (balanceUsed || 0),
      notes
    }, { transaction: t });
    
    // 创建订单明细
    for (const item of items) {
      await models.OrderItem.create({
        orderId: order.id,
        dishId: item.dishId,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      }, { transaction: t });
    }
    
    // 处理会员余额支付
    if (memberId && balanceUsed > 0) {
      const member = await models.Member.findByPk(memberId, { transaction: t });
      if (member.balance < balanceUsed) {
        await t.rollback();
        return res.status(400).json({ error: '余额不足' });
      }
      
      await member.update({
        balance: member.balance - balanceUsed,
        totalSpent: member.totalSpent + finalAmount,
        visitCount: member.visitCount + 1,
        lastVisit: new Date()
      }, { transaction: t });
    }
    
    // 更新菜品销量
    for (const item of items) {
      await models.Dish.increment('soldCount', { 
        by: item.quantity, 
        where: { id: item.dishId },
        transaction: t 
      });
    }
    
    await t.commit();
    
    res.json({ 
      success: true, 
      order: order.get({ plain: true }),
      orderNumber: order.orderNumber
    });
  } catch (error) {
    await t.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ error: '创建订单失败' });
  }
});

// 获取订单状态
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await models.Order.findByPk(id, {
      include: [
        { model: models.Table },
        { model: models.Member },
        { model: models.OrderItem, include: [{ model: models.Dish }] }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: '获取订单失败' });
  }
});

// 获取餐桌
router.get('/tables', async (req, res) => {
  try {
    const tables = await models.Table.findAll({
      where: { isActive: true },
      order: [['number', 'ASC']]
    });
    
    res.json(tables);
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({ error: '获取餐桌列表失败' });
  }
});

module.exports = router;