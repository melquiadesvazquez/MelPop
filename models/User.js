'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Defining the schema
const userSchema = mongoose.Schema({
  name: { type: String, required: true, index: true },
  email: { type: String, required: true, index: true, unique: true },
  password: { type: String, required: true },
  created: { type: Date, default: Date.now, index: true }
});

userSchema.statics.hashPassword = async function (plainPassword) {
  return bcrypt.hash(plainPassword, 10);
}

// Creating the model with the schema
const User = mongoose.model('User', userSchema);

// Export the model
module.exports = User;
