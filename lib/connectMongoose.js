'use strict';

const mongoose = require('mongoose');
const conn = mongoose.connection;

conn.on('error', err => {
  console.error('Connection error', err);
  process.exit(1);
});

conn.once('open', () => {
  console.log('Connected to MongoDB on', conn.name);
});

mongoose.connect(`${process.env.DB_PROTOCOL}://${process.env.DB_USER_PWD}${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, { useNewUrlParser: true });

module.exports = conn;
