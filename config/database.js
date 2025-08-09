const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.db',
  pool: { 
    max: 5, 
    min: 0, 
    acquire: 30000, 
    idle: 10000 
  },
  logging: false,
  define: {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true
  }
});

// 数据库优化设置
sequelize.query("PRAGMA journal_mode = WAL");
sequelize.query("PRAGMA synchronous = NORMAL");
sequelize.query("PRAGMA cache_size = 10000");

module.exports = sequelize;