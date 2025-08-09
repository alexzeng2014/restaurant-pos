module.exports = (sequelize, DataTypes) => {
  const DishCategory = sequelize.define('DishCategory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    dishId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'dish_categories',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['dishId', 'categoryId']
      }
    ]
  });
  
  return DishCategory;
};