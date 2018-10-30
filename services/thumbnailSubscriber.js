'use strict';

// Subscriber to creating thumbnails service
const cote = require('cote');
const subscriber = new cote.Subscriber({name: 'thumbnail subscriber'});

subscriber.on('generate thumbnail done', (update) => {
  console.log('+++++++++');
  console.log(update);
  console.log('+++++++++');
});
