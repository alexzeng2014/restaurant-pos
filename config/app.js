module.exports = {
  port: process.env.PORT || 3000,
  sessionSecret: process.env.SESSION_SECRET || 'restaurant-pos-secret-key',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  uploadDir: './public/uploads',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  sessionTimeout: 24 * 60 * 60 * 1000, // 24小时
  defaultAdmin: {
    username: 'admin',
    password: 'admin123'
  },
  defaultKitchen: {
    username: 'kitchen',
    password: 'kitchen123'
  }
};