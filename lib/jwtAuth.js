'use strict';

const jwt = require('jsonwebtoken');

// Returns a middleware that verifies the JWT token
module.exports = () => {
  return (req, res, next) => {
    // Get the token
    const token = req.body.token || req.query.token || req.get('x-access-token');

    if (!token) {
      const err = new Error('no token provided');
      next(err);
    }

    // verify the jwt token
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        next(error);
        return;
      }
      req.apiUserId = decoded._id;

      // run next
      next();
    });
  }
}
