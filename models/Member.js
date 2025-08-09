module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define('Member', {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    phone: { 
      type: DataTypes.STRING(20), 
      unique: true, 
      allowNull: false 
    },
    name: { 
      type: DataTypes.STRING(100) 
    },
    password: { 
      type: DataTypes.STRING(255) 
    },
    balance: { 
      type: DataTypes.DECIMAL(10,2), 
      defaultValue: 0 
    },
    points: { 
      type: DataTypes.INTEGER, 
      defaultValue: 0 
    },
    level: { 
      type: DataTypes.STRING(20), 
      defaultValue: 'bronze',
      validate: { isIn: [['bronze', 'silver', 'gold', 'platinum']] }
    },
    totalSpent: { 
      type: DataTypes.DECIMAL(10,2), 
      defaultValue: 0 
    },
    totalRecharged: { 
      type: DataTypes.DECIMAL(10,2), 
      defaultValue: 0 
    },
    visitCount: { 
      type: DataTypes.INTEGER, 
      defaultValue: 0 
    },
    lastVisit: { 
      type: DataTypes.DATE 
    },
    isActive: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    },
    createdBy: { 
      type: DataTypes.INTEGER 
    }
  }, {
    tableName: 'members',
    timestamps: true
  });
  
  return Member;
};