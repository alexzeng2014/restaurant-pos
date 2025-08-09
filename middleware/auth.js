const bcrypt = require('bcryptjs');
const models = require('../models');

const requireAuth = (roles = []) => {
  return async (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    
    if (roles.length && !roles.includes(req.session.user.role)) {
      return res.status(403).send('权限不足');
    }
    
    try {
      const user = await models.SystemUser.findByPk(req.session.user.id);
      if (!user || !user.isActive) {
        req.session.destroy();
        return res.redirect('/login');
      }
      
      req.session.user = user.get({ plain: true });
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      req.session.destroy();
      return res.redirect('/login');
    }
  };
};

const requireGuest = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/admin');
  }
  next();
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  requireAuth,
  requireGuest,
  hashPassword,
  comparePassword
};