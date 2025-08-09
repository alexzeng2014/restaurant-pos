module.exports = (sequelize, DataTypes) => {
  const Table = sequelize.define('Table', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100)
    },
    capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 4
    },
    area: {
      type: DataTypes.STRING(50)
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'tables',
    timestamps: true
  });
  
  return Table;
};