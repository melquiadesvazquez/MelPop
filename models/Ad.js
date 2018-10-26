'use strict';

const mongoose = require('mongoose');
const tags = ['lifestyle', 'work', 'motor', 'mobile'];

// Defining the schema
const adSchema = mongoose.Schema({
  name: { type: String, required: true, index: true },
  forSale: { type: Boolean, default: true, required: true, index: true },
  price: { type: Number, min: 0, required: true, index: true },
  picture: {
    type: String,
    set: function (path) {
      // Generating the picture url from the path
      return `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}/${process.env.ADS_IMAGES_PATH}/${path}`;
    },
    required: true
  },
  tags: {
    type: [{
      type: String,
      lowercase: true,
      trim: true,
      enum: tags
    }],
    required: true,
    index: true
  },
  created: { type: Date, default: Date.now, index: true }
});

// Counting all
adSchema.statics.count = function (name, tag, forSale, price) {
  // Creating the filter
  const filter = this.filter(name, tag, forSale, price);

  return Ad.countDocuments(filter);
}

// Creating the list method
adSchema.statics.list = function (name, tag, forSale, price, skip, limit, fields, sort) {
  // Creating the filter
  const filter = this.filter(name, tag, forSale, price);
  const query = Ad.find(filter);
  query.skip(parseInt(skip));
  query.limit(parseInt(limit));
  query.select(fields);
  query.sort(sort);

  return query.exec();
}

// Creating the list method
adSchema.statics.filter = function (name, tag, forSale, price) {
  // Creating the filter
  const filter = {};

  // Returning the ads that contain the word
  if (name) filter.name = { $regex: `^${name}`, $options: 'i' };

  // Returning all the ads with the categories (OR, if we need an AND we will use $all instead of $in)
  if (tag) filter.tags = { '$in': tag };

  // In case TRUE, True, FALSE or False is received
  if (forSale) filter.forSale = forSale.toLowerCase();

  // There are 4 situations 10-50, 50-, -50, 50
  if (price) {
    const priceRange = price.match(/^([0-9]+)-([0-9]+)$/);
    const priceGt = price.match(/^([0-9]+)-$/);
    const priceLt = price.match(/^-([0-9]+)$/);

    if (priceRange) {
      filter.price = { '$gte': parseInt(priceRange[1]), '$lte': parseInt(priceRange[2]) };
    } else if (priceGt) {
      filter.price = { '$gte': priceGt[1] };
    } else if (priceLt) {
      filter.price = { '$lte': priceLt[1] };
    } else {
      filter.price = price;
    }
  }

  return filter;
}

// Setting the tags
adSchema.statics.getTags = function () {
  return tags;
}

// Creating the model with the schema
const Ad = mongoose.model('Ad', adSchema);

// Export the model
module.exports = Ad;
