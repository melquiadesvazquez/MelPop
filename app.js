var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const { isAPI, isWeb } = require('./lib/utils');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').__express);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Global variables for the view
app.locals.mainTitle = 'Nodepop';
app.locals.mainDescription = 'Connecting Buyers and Sellers Locally';

// Connect to the database and load the models
require('./lib/connectMongoose');
const Ad = require('./models/Ad');

// API/Web routes
app.use('/', require('./routes/index'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // validation error
  let errorInfo = '';
  if (err.array) {
    err.status = 422;
    errorInfo = err.array({ onlyFirstError: true })[0];
    err.message = { message: 'Not valid', errors: err.mapped() };
  }

  res.status(err.status || 500);

  if (isAPI(req)) {
    res.json({ success: false, error: err.message });
    return;
  } else if (isWeb(req)) {
    res.render('ads', { ads: [], tags: Ad.getTags(), pages: [], search: req.query, error: `Not valid - ${errorInfo.param} ${errorInfo.msg}` });
    return;
  }

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.render('error');
});

module.exports = app;
