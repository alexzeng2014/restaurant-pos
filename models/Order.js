module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    tableId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    memberId: {
      type: DataTypes.INTEGER
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      validate: { isIn: [['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']] }
    },
    subtotal: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    discount: {
      type: DataTypes.DECIMAL(10,2),
      defaultValue: 0
    },
    finalAmount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    paymentMethod: {
      type: DataTypes.STRING(20),
      defaultValue: 'cash'
    },
    balanceUsed: {
      type: DataTypes.DECIMAL(10,2),
      defaultValue: 0
    },
    cashAmount: {
      type: DataTypes.DECIMAL(10,2),
      defaultValue: 0
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'orders',
    timestamps: true
  });
  
  return Order;
};