module.exports = (sequelize, DataTypes) => {
  const SystemUser = sequelize.define('SystemUser', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'admin',
      validate: { isIn: [['admin', 'kitchen']] }
    },
    name: {
      type: DataTypes.STRING(100)
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'system_users',
    timestamps: true
  });
  
  return SystemUser;
};