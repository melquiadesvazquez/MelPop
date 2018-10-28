'use strict';

const jwt = require('jsonwebtoken');
const createError = require('http-errors');

// Returns a middleware that verifies the JWT token
module.exports = () => {
  return (req, res, next) => {
    // Get the token
    const token = req.body.token || req.query.token || req.get('x-access-token');
    if (!token) { // res.json({success: false, error: res.__('Invalid credentials')});
      next(createError(401, res.__('missing authorization token')));
      return;
    }

    // verify the jwt token
    try {
      jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
          next(createError(401, res.__('invalid authorization token')));
          return;
        }
        req.apiUserId = decoded._id;

        // run next
        next();
      });
    } catch (error) {
      next(error);
    }
  }
}
