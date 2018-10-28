const request = require('supertest');
const assert = require('assert');

require('dotenv').config();

// loading the app for testing
const app = require('../app');

let token = null;
const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmQ1YjAzYmQwZjA2ODVmMzA5OTRlYmEiLCJpYXQiOjE1NDA3MzQ5NDgsImV4cCI6MTU0MDczNTI0OH0.xwvkXH5s86-unF-zHU9gaYkW7ZGovoXbMojEXb1th-k';

describe(`Api authentication`, function () {
  it('respond with json containing auth token', function (done) {
    request(app)
      .post(`/${process.env.API_PATH}/authenticate`)
      .send({email: process.env.TEST_USER, password: process.env.TEST_PWD})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      // .expect({success: true})
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        token = res.body.token;
        done();
      });
  });
});

describe(`Api ads with JWT`, function () {
  it('respond with json', function (done) {
    request(app)
      .get(`/${process.env.API_PATH}/ads`)
      .set('x-access-token', token)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      // .expect({success: true})
      .expect(200, done);
  });
});

describe(`Api ads with expired JWT`, function () {
  it('respond with json', function (done) {
    request(app)
      .get(`/${process.env.API_PATH}/ads`)
      .set('x-access-token', expiredToken)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      // .expect({success: true})
      .expect(200, done);
  });
});

describe(`Api ads without JWT`, function () {
  it('respond with json', function (done) {
    request(app)
      .get(`/${process.env.API_PATH}/ads`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      // .expect({success: false})
      .expect(401, done);
  });
});

/*
// sintaxis de Mocha
describe('Home', function () { // no debemos usar arrow functions aqui
  it('should return 200', function (done) {
    request(app)
      .get('/')
      .expect(200, done); // verifica que devuelve un codigo con http status 200
    // y luego llama a done()
  });
})

describe('Login', function () { // no debemos usar arrow functions aqui
  it('should return 200', function (done) {
    request(app)
      .get('/login')
      .expect(200, done); // verifica que devuelve un codigo con http status 200
    // y luego llama a done()
  });
})
*/
