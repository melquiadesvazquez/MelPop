'use strict';

require('dotenv').config();

const readline = require('readline');
const ads = require('./data/ads.json').ads;
const conn = require('./lib/connectMongoose');
const Ad = require('./models/Ad');

conn.once('open', async () => {
  try {
    const response = await askUser('Are you sure you want to reset the database? (no) ');

    if (response.toLowerCase() !== 'yes') {
      console.log('Database reset aborted');
      process.exit();
    }

    await initAds(ads);
    conn.close();
    process.exit();
  } catch (err) {
    console.log('There was an error', err);
    process.exit(1);
  }
});

function askUser (question) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(question,
      function (answer) {
        rl.close();
        resolve(answer);
      }
    );
  });
}

async function initAds (ads) {
  // Delete the existing ads
  const deleted = await Ad.deleteMany();
  console.log(`Deleted ${deleted.n} ads.`);

  // Load the default ads
  const inserted = await Ad.insertMany(ads);
  console.log(`Loaded ${inserted.length} ads.`);
}
