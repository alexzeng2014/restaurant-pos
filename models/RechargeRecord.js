module.exports = (sequelize, DataTypes) => {
  const RechargeRecord = sequelize.define('RechargeRecord', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    memberId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    beforeBalance: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    afterBalance: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    operatorId: {
      type: DataTypes.INTEGER
    },
    paymentMethod: {
      type: DataTypes.STRING(20),
      defaultValue: 'cash'
    },
    remark: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'recharge_records',
    timestamps: true
  });
  
  return RechargeRecord;
};