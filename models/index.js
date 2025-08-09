const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const SystemUser = require('./SystemUser');
const Member = require('./Member');
const Category = require('./Category');
const Dish = require('./Dish');
const Table = require('./Table');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const RechargeRecord = require('./RechargeRecord');
const DishCategory = require('./DishCategory');

// 定义模型关联
SystemUser.hasMany(Member, { foreignKey: 'createdBy' });
Member.belongsTo(SystemUser, { foreignKey: 'createdBy' });

Member.hasMany(Order, { foreignKey: 'memberId' });
Order.belongsTo(Member, { foreignKey: 'memberId' });

Member.hasMany(RechargeRecord, { foreignKey: 'memberId' });
RechargeRecord.belongsTo(Member, { foreignKey: 'memberId' });

SystemUser.hasMany(RechargeRecord, { foreignKey: 'operatorId' });
RechargeRecord.belongsTo(SystemUser, { foreignKey: 'operatorId' });

Table.hasMany(Order, { foreignKey: 'tableId' });
Order.belongsTo(Table, { foreignKey: 'tableId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Dish.hasMany(OrderItem, { foreignKey: 'dishId' });
OrderItem.belongsTo(Dish, { foreignKey: 'dishId' });

Dish.belongsToMany(Category, { through: DishCategory, foreignKey: 'dishId' });
Category.belongsToMany(Dish, { through: DishCategory, foreignKey: 'categoryId' });

const models = {
  SystemUser,
  Member,
  Category,
  Dish,
  Table,
  Order,
  OrderItem,
  RechargeRecord,
  DishCategory,
  sequelize
};

module.exports = models;