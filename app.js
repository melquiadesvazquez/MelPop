var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const { isAPI, isWeb } = require('./lib/utils');
const loginController = require('./routes/loginController');
const i18n = require('./lib/i18nConfigure')();

var app = express();

// Views engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').__express);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configure multilanguage
app.use(i18n.init)

// Global variables for the view
app.locals.mainTitle = 'MelPop';
app.locals.mainDescription = 'Connecting Buyers and Sellers Locally';
app.locals.apiPath = process.env.API_PATH;

// Connect to the database and load the models
require('./lib/connectMongoose');
const Ad = require('./models/Ad');

// Init/Load the session when the request is received
app.use(session({
  name: 'melpop-session',
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 5 * 60 * 1000, httpOnly: true }, // the session will expire in 5 minutes
  store: new MongoStore({
    url: `${process.env.DB_PROTOCOL}://${process.env.DB_USER_PWD}${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
  })
}));

// Homepage
app.use('/', require('./routes/index'));

// Switch language url
app.use('/lang', require('./routes/lang'));

// Web authentication
app.get('/login', loginController.index);
app.post('/login', loginController.post);
app.get('/logout', loginController.logout);

// API authentication
app.use(`/${process.env.API_PATH}`, require('./routes/api'));
app.post(`/${process.env.API_PATH}/authenticate`, loginController.postJWT);

// Web routes
app.use('/', require('./routes/web'));
app.use('/new', require('./routes/new'));

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
