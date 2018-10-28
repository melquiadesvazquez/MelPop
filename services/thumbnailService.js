'use strict';

// Service for creating thumbnails from images
const cote = require('cote');
const sharp = require('sharp');
const path = require('path');

const responder = new cote.Responder({ name: 'thumbnail responder' });

// request (req): { picture: '...jpg', resize: 250 }
responder.on('generate thumbnail', (req, done) => {
  console.log('service: thumbnail from', req.picture, req.resize, Date.now());

  const imgDir = path.join(__dirname, '..', 'public/images/ads');

  sharp(`${imgDir}/${req.picture}`)
    .resize(req.resize, req.resize)
    .toFile(`${imgDir}/thumbnails/${req.picture}`)
    .then(info => {
      done(info);
    })
    .catch(err => {
      console.log('service problem:', err);
      done(err);
    });
});
