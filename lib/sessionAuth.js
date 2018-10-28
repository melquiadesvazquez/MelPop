'use strict';

// Middleware to check if an use is logged in
const namedRoutes = require('./namedRoutes');
const User = require('../models/User');

module.exports = function () {
  return function (req, res, next) {
    if (!req.session.authUser) { // if not logged in
      res.redirect(namedRoutes.login);
      return;
    }

    User.findById(req.session.authUser._id).then(user => {
      req.user = user;
      next();
    });
  }
}
