const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// 初始化模型
const SystemUser = require('./SystemUser')(sequelize, Sequelize.DataTypes);
const Member = require('./Member')(sequelize, Sequelize.DataTypes);
const Category = require('./Category')(sequelize, Sequelize.DataTypes);
const Dish = require('./Dish')(sequelize, Sequelize.DataTypes);
const Table = require('./Table')(sequelize, Sequelize.DataTypes);
const Order = require('./Order')(sequelize, Sequelize.DataTypes);
const OrderItem = require('./OrderItem')(sequelize, Sequelize.DataTypes);
const RechargeRecord = require('./RechargeRecord')(sequelize, Sequelize.DataTypes);
const DishCategory = require('./DishCategory')(sequelize, Sequelize.DataTypes);

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
  sequelize,
  Sequelize
};

module.exports = models;