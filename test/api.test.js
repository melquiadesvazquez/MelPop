const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const cote = require('cote');

const subscriber = new cote.Subscriber({name: 'thumbnail subscriber'});

require('dotenv').config();

// run thumbnail microservice in a new window
exec('start cmd.exe @cmd /k "npm run thumbSrv"');

// loading the app for testing
const app = require('../app');
const imgDir = path.join(__dirname, '..', 'public/images/ads');
let token = null;
let ad = null;

describe('POST /authenticate', function () {
  it('Api authentication returns JWT token', function (done) {
    request(app)
      .post(`/${process.env.API_PATH}/authenticate`)
      .send({email: process.env.TEST_USER, password: process.env.TEST_PWD})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).to.be.equal(true);
        expect(res.body).to.have.property('token');
        token = res.body.token;
        done();
      });
  });
});

describe('GET /ads', function () {
  it('Api gets all ads with valid JWT token', function (done) {
    request(app)
      .get(`/${process.env.API_PATH}/ads`)
      .set('x-access-token', token)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).to.be.equal(true);
        expect(res.body).to.have.property('result');
        done();
      });
  });
});

describe('GET /ads', function () {
  it('Api shouldn\'t get any ads with expired JWT token', function (done) {
    request(app)
      .get(`/${process.env.API_PATH}/ads`)
      .set('x-access-token', process.env.TEST_TOKEN)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).to.be.equal(false);
        expect(res.body.error).to.be.equal('invalid authorization token');
        done();
      });
  });
});

describe('GET /ads', function () {
  it('Api should not get any ads without JWT token', function (done) {
    request(app)
      .get(`/${process.env.API_PATH}/ads`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).to.be.equal(false);
        expect(res.body.error).to.be.equal('missing authorization token');
        done();
      });
  });
});

describe(`GET /ads/tags`, function () {
  it('Api gets all tags', function (done) {
    request(app)
      .get(`/${process.env.API_PATH}/ads/tags`)
      .set('x-access-token', token)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).to.be.equal(true);
        expect(res.body).to.have.property('result');
        done();
      });
  });
});

describe(`POST /ads`, function () {
  it('Api creates an ad', function (done) {
    request(app)
      .post(`/${process.env.API_PATH}/ads`)
      .field('name', 'testname1')
      .field('forSale', false)
      .field('price', 10)
      .field('tags', process.env.ADS_TAGS.split(',')[0])
      .attach('picture', `${imgDir}/vintage-1283299_1920.jpg`)
      .set('x-access-token', token)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).to.be.equal(true);
        expect(res.body).to.have.property('result');
        ad = res.body.result;
        done();
      });
  });
});

describe(`GET /ads/:id`, function () {
  it('Api gets ad from id', function (done) {
    request(app)
      .get(`/${process.env.API_PATH}/ads/${ad._id}`)
      .set('x-access-token', token)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).to.be.equal(true);
        expect(res.body).to.have.property('result');
        done();
      });
  });
});

describe(`PUT /ads/:id`, function () {
  it('Api updates an ad', function (done) {
    request(app)
      .put(`/${process.env.API_PATH}/ads/${ad._id}`)
      .send({
        name: 'testname2',
        forSale: true,
        price: 20,
        tags: process.env.ADS_TAGS.split(',')[1]
      })
      .set('x-access-token', token)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).to.be.equal(true);
        expect(res.body).to.have.property('result');
        done();
      });
  });
});

describe(`DELETE /ads/:id`, function () {
  it('Api deletes an ad', function (done) {
    request(app)
      .delete(`/${process.env.API_PATH}/ads/${ad._id}`)
      .set('x-access-token', token)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).to.be.equal(true);
        expect(res.body).to.have.property('result');

        // delete image from file system
        const imgBase = path.parse(ad.picture).base;
        // once the microservice has finished we can delete the thumbnail
        subscriber.on('generate thumbnail done', (update) => {

          console.log("++++++++++++++++++")
          console.log("before image done")
          console.log("++++++++++++++++++")
          fs.unlink(`${imgDir}/${imgBase}`, (err) => {
            if (err) throw err;

            setTimeout(() => done(), 5000);
            console.log("++++++++++++++++++")
            console.log("before thumbnail done")
            console.log("++++++++++++++++++")

              /*
              fs.unlink(`${imgDir}/thumbnails/${imgBase}`, (err) => {
                if (err) throw err;
                setTimeout(() => process.exit(), 5000);
              });
              */
          });
        });
      });
  });
});
