'use strict';

const i18n = require('i18n');
const path = require('path');

module.exports = function () {
  i18n.configure({
    locales: ['en', 'es'],
    directory: path.join(__dirname, '..', 'locales'),
    defaultLocale: 'en',
    autoreload: true,
    syncFiles: true,
    cookie: 'melpop-lang' // use the locale from this cookie
  });

  i18n.setLocale('en');

  return i18n;
}
