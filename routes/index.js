'use strict';

const express = require('express');
const paginate = require('express-paginate');
const router = express.Router();
const createError = require('http-errors');
const { query, validationResult } = require('express-validator/check');
const { isAPI, isSubset } = require('../lib/utils');
const Ad = require('../models/Ad');

// Maximum X items per page with Y in total
router.use(paginate.middleware(parseInt(process.env.API_PAGE_ITEMS_LIMIT), parseInt(process.env.API_TOTAL_ITEMS_LIMIT)));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

/**
 * GET /
 * Returns list of ads for both web and api
 */
router.get('(/apiv1)?/ads', [
  query('tag').optional({ checkFalsy: true }).custom(tag => isSubset(tag, Ad.getTags())).withMessage('must be a valid tag'),
  query('forSale').optional({ checkFalsy: true }).isBoolean().withMessage('must be a boolean'),
  query('price').optional({ checkFalsy: true }).custom(price => price.match(/^([0-9]+)?-[0-9]+$/) || price.match(/^[0-9]+-?$/)).withMessage('must be a valid price: i.e. 10-50, 50-, -50, 50'),
  query('limit').optional({ checkFalsy: true }).isNumeric().withMessage('must be numeric'),
  query('page').optional({ checkFalsy: true }).isNumeric().withMessage('must be numeric')
], async (req, res, next) => {
  try {
    // Run validations
    validationResult(req).throw();

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
 * GET /tags
 * Returns list of tags
 */
router.get('/apiv1/ads/tags', async (req, res, next) => {
  try {
    // Get the tag list to pass it to the view
    const tags = Ad.getTags();

    let result = [];

    // Search on the DB
    for (const tag of tags) {
      result.push({ [tag]: await Ad.count(null, tag, null, null) });
    };

    // Returns the result
    res.json({ success: true, result: result });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /:id
 * Returns an ad
 */
router.get('/apiv1/ads/:id', async (req, res, next) => {
  try {
    // Getting the parameters from the url
    const _id = req.params.id;

    // Search on the DB
    const ad = await Ad.findById(_id).exec();

    if (!ad) {
      next(createError(404));
      return;
    }

    // Returns the result
    res.json({ success: true, result: ad });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /
 * Creates an ad
 */
router.post('/apiv1/ads/', async (req, res, next) => {
  try {
    // Getting the parameters from POST data
    const data = req.body;

    // Creating an ad in memory
    const ad = new Ad(data);

    // Save on the DB
    const adSaved = await ad.save();

    // Returns the result
    res.json({ success: true, result: adSaved });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /:id
 * Deletes an ad
 */
router.delete('/apiv1/ads/:id', async (req, res, next) => {
  try {
    // Getting the parameters from the url
    const _id = req.params.id;

    // Delete on the DB
    const adDeleted = await Ad.findByIdAndRemove(_id).exec();

    // Returns the result
    res.json({ success: true, result: adDeleted });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /:id
 * Update an ad
 */
router.put('/apiv1/ads/:id', async (req, res, next) => {
  try {
    // Getting the parameters from the url
    const _id = req.params.id;

    // Getting the parameters from POST data
    const data = req.body;

    // Save on the DB and returns the ads
    const adUpdated = await Ad.findByIdAndUpdate(_id, { '$set': data }, { new: true }).exec();

    // Returns the result
    res.json({ success: true, result: adUpdated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
