'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const namedRoutes = require('../lib/namedRoutes');

// This controller will match routes on app.js
class LoginController {
  // GET "/"
  index (req, res, next) {
    res.locals.email = process.env.NODE_ENV === 'development' ? process.env.TEST_USER : '';
    res.locals.error = '';
    res.render('login');
  }

  async post (req, res, next) {
    try {
      // collect the parameters from the body of the request
      const email = req.body.email;
      const password = req.body.password;

      // Find the user on the database
      const user = await User.findOne({email: email})

      if (!user || !await bcrypt.compare(password, user.password)) {
        res.locals.email = email;
        res.locals.error = res.__('Invalid credentials');
        res.render('login');
        return;
      }

      // User found and password correct
      jwt.sign({_id: user._id}, process.env.JWT_SECRET, {
        expiresIn: '5m' // the token will expire in 5 minutes
      }, (err, token) => {
        if (err) {
          next(err);
          return;
        }

        // Record the user identity on the session
        req.session.authUser = {_id: user._id, token: token}
        res.redirect(namedRoutes.ads);
      });
    } catch (err) {
      next(err);
    }
  }

  async postJWT (req, res, next) {
    try {
      // collect the parameters from the body of the request
      const email = req.body.email;
      const password = req.body.password;

      // Find the user on the database
      const user = await User.findOne({email: email})

      if (!user || !await bcrypt.compare(password, user.password)) {
        res.json({success: false, error: res.__('Invalid credentials')});
        return;
      }

      // User found and password correct
      jwt.sign({_id: user._id}, process.env.JWT_SECRET, {
        expiresIn: '5m' // the token will expire in 5 minutes
      }, (err, token) => {
        if (err) {
          next(err);
          return;
        }
        res.json({success: true, token});
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /logout
  logout (req, res, next) {
    delete req.session.authUser; // remove authUser from the session
    req.session.regenerate(function (err) {
      if (err) {
        next(err);
        return;
      }
      res.redirect(namedRoutes.home);
    });
  }
}

module.exports = new LoginController();
