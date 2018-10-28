'use strict';

require('dotenv').config();

const readline = require('readline');
const conn = require('./lib/connectMongoose');
const User = require('./models/User');
const Ad = require('./models/Ad');
const {users, ads} = require('./data/data.json');

conn.once('open', async () => {
  try {
    const response = await askUser('Are you sure you want to reset the database? (no) ');

    if (response.toLowerCase() !== 'yes' && response.toLowerCase() !== 'y') {
      console.log('Database reset aborted');
      process.exit();
    }

    await initData(users, ads);
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

async function initData (users, ads) {
  // Delete the existing data
  const deletedUsers = await User.deleteMany();
  const deletedAds = await Ad.deleteMany();
  console.log(`Deleted ${deletedUsers.n} users.`);
  console.log(`Deleted ${deletedAds.n} ads.`);

  // Hash the passwords
  for (let i = 0; i < users.length; i++) {
    users[i].password = await User.hashPassword(users[i].password)
  };

  // Load the default data
  const insertedUsers = await User.insertMany(users);
  const insertedAds = await Ad.insertMany(ads);
  console.log(`Loaded ${insertedUsers.length} users.`);
  console.log(`Loaded ${insertedAds.length} ads.`);
}
