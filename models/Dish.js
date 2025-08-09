module.exports = (sequelize, DataTypes) => {
  const Dish = sequelize.define('Dish', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    memberPrice: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    image: {
      type: DataTypes.STRING(255)
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isSpecial: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    soldCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: -1 // -1表示无限库存
    }
  }, {
    tableName: 'dishes',
    timestamps: true
  });
  
  return Dish;
};