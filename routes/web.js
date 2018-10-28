'use strict';

const express = require('express');
const paginate = require('express-paginate');
const router = express.Router();
const { query, validationResult } = require('express-validator/check');
const { isAPI, isSubset } = require('../lib/utils');
const Ad = require('../models/Ad');
const upload = require('../lib/uploadConfig');
const sessionAuth = require('../lib/sessionAuth');
const namedRoutes = require('../lib/namedRoutes');

// Autentication with session
router.use(sessionAuth());

// Maximum X items per page with Y in total
router.use(paginate.middleware(parseInt(process.env.API_PAGE_ITEMS_LIMIT), parseInt(process.env.API_TOTAL_ITEMS_LIMIT)));

// Save the request parameters and the session on local variables
router.use(function (req, res, next) {
  res.locals.session = req.session;
  res.locals.query = req.query;
  res.locals.url = req.originalUrl;
  next();
});

/**
 * GET /
 * Returns list of ads for both web and api
 */
router.get('/ads', [
  query('tag').optional({ checkFalsy: true }).custom(tag => isSubset(tag, Ad.getTags())).withMessage('must be a valid tag'),
  query('forSale').optional({ checkFalsy: true }).isBoolean().withMessage('must be a boolean'),
  query('price').optional({ checkFalsy: true }).custom(price => price.match(/^([0-9]+)?-[0-9]+$/) || price.match(/^[0-9]+-?$/)).withMessage('must be a valid price: i.e. 10-50, 50-, -50, 50'),
  query('limit').optional({ checkFalsy: true }).isNumeric().withMessage('must be numeric'),
  query('page').optional({ checkFalsy: true }).isNumeric().withMessage('must be numeric')
], async (req, res, next) => {
  try {
    // Run validations
    validationResult(req).throw();

    // Get the ads
    const ads = await Ad.list(req.query.name, req.query.tag, req.query.forSale, req.query.price, req.skip, req.query.limit, '-__v', req.query.sort);

    // Get the tag list to pass it to the view
    const tags = Ad.getTags();

    // Handle the pagination with maximum 8 pages
    const itemCount = await Ad.count(req.query.name, req.query.tag, req.query.forSale, req.query.price);
    const pageCount = Math.ceil(itemCount / req.query.limit);
    const pages = paginate.getArrayPages(req)(parseInt(process.env.API_PAGE_LIMIT), pageCount, req.query.page);

    // Return different results depending on the request (API / Web)
    isAPI(req) ? res.json({ success: true, result: ads, pages: pages }) : res.render('ads', { ads: ads, tags: tags, pages: pages, search: req.originalUrl, error: false });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /
 * Creates an ad
 */
router.post('/ads', upload.single('picture'), async (req, res, next) => {
  try {
    // Getting the parameters from POST data
    const data = req.body;
    data.picture = req.file.filename;

    // Creating an ad in memory
    const ad = new Ad(data);

    // Save on the DB
    await ad.save();

    // Returns the result
    res.redirect(namedRoutes.ads);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
