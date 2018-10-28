'user strict';

const express = require('express');
const router = express.Router();

router.get('/:locale', (req, res, next) => {
  // get the language code
  const locale = req.params.locale;

  // get the redirect page
  const backTo = req.get('referer');

  // set a cookie with the language
  res.cookie('melpop-lang', locale, { maxAge: 1000 * 60 * 60 * 24 * 14 });

  // redirect the user to the previous page
  res.redirect(backTo);
});

module.exports = router;
