'use strict';

const cote = require('cote');
const multer = require('multer');
const path = require('path');

// Multer upload config
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // choose the path dynamically
    callback(null, path.join(__dirname, '..', 'public/images/ads'));
  },
  filename: (req, file, callback) => {
    const requester = new cote.Requester({ name: 'thumbnail client' });
    const picture = file.fieldname + '-' + Date.now() + '-' + file.originalname;

    requester.send({
      type: 'generate thumbnail',
      picture,
      resize: 100
    }, res => {
      console.log(res)
      console.log(`client: ${picture} --> ${res}`, Date.now());
    });

    callback(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
  }
});

module.exports = multer({storage});
