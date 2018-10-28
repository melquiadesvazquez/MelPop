'user strict';

const express = require('express');
const router = express.Router();
const sessionAuth = require('../lib/sessionAuth');

// Todas las llamadas a este router requieren autenticación
router.use(sessionAuth());

// GET new ad page.
router.get('/', (req, res, next) => {
  res.locals.tags = process.env.ADS_TAGS.split(',');
  res.render('new');
});

module.exports = router;
