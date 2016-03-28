'use strict';

let chai = require('chai');
let chaiHTTP = require('chai-http');
chai.use(chaiHTTP);
let expect = require('chai').expect;
let request = require('chai').request;
let mongoose = require('mongoose');
// require('dotenv').load();
let User = require(__dirname + '/../models/users-schema');
let Gig = require(__dirname + '/../models/gigs-schema');

// mongoose.connect('mongodb://localhost/testdb');
require(__dirname + '/../server');
let userId;
let userToken;
describe('Testing users router and authentication', () => {

  before((done) => {
    let newGig = new Gig({name:"dog bed", category:"music", description:"A comfy dog bed"});
    newGig.save((err, gig) => {
      console.log('BEFORE BLOCK GIGGGGGG : ', gig);
      done();
    });
  });
  // CREATING A NEW USER
  it('Should create a new user and save to database', (done) => {
    request('localhost:3000')
    .post('/public/user')
    .send('{"username":"sam", "password":"lucy", "firstName":"Sam", "lastName":"Gruse", "occupation":"coder", "email":"sgruse89@gmail.com"}')
    .end((err, res) => {
      expect(err).to.eql(null);
      expect(res.status).to.eql(200);
      expect(res.body.username).to.eql('sam');
      expect(res.body.email).to.eql('sgruse89@gmail.com');
      userId = res.body._id;
      done();
    });
  });
  // FAIL TO CREATE A USER WITH THE SAME NAME
  it('Should fail to create a user with the same name as existing user', (done) => {
    request('localhost:3000')
    .post('/public/user')
    .send('{"username":"sam", "password":"ally"}')
    .end((err, res) => {
      expect(res.status).to.eql(404);
      expect(res.body.msg).to.eql('Username already exists');
      done();
    });
  });
  // LOGIN WITH WITH US/PW AND GET USER TOKEN
  it('Should login with correct user credentials and receive token', (done) => {
    request('localhost:3000')
    .post('/login/login')
    .auth('sam:lucy')
    .end((err, res) => {
      expect(res.status).to.eql(200);
      expect(res.body).to.have.property('token');
      userToken = res.body.token;
      done();
    });
  });
  // FAIL LOGIN WITH WRONG CREDENTIALS
  it('Should fail login with incorrect password', (done) => {
    request('localhost:3000')
    .post('/login/login')
    .auth('sam:lucky')
    .end((err, res) => {
      expect(res.status).to.eql(400);
      expect(res.body.message).to.eql('invalid login');
      done();
    });
  });
  // CARRY OUT GET REQUEST WITH USER TOKEN
  it('Should successfully carry out a GET request to gigs with user token', (done) => {
    request('localhost:3000')
    .get('/api/gigs')
    .set('Authorization', 'token ' + userToken)
    .end((err, res) => {
      expect(res.status).to.eql(200);
      expect(res.body).to.be.a('array');
      expect(res.body[0].name).to.eql('dog bed');
      done();
    });
  });
  // FAIL TO "GET" BECUASE OF USER TOKEN
  it('Should not get any data because of incorrect user token', (done) => {
    request('localhost:3000')
    .get('/api/gigs')
    .set('Authorization', 'token ' + 'someString')
    .end((err, res) => {
      expect(res.status).to.eql(400);
      expect(res.body.message).to.eql('authentication error');
      done();
    });
  });
  // UPDATE THE EXISTING USER
  it('Should update the existing user "sam" to have a different last name of "Ben"', (done) => {
    request('localhost:3000')
    .put('/public/user/' + userId)
    .send('{"lastName":"Ben"}')
    .end((err, res) => {
      expect(res.status).to.eql(200);
      expect(res.body.nModified).to.eql(1);
      done();
    });
  });
  // DELETE THE EXISTING USER
  it('Should delete the user "Sam"', (done) => {
    request('localhost:3000')
    .delete('/public/user/' + userId)
    .end((err, res) => {
      expect(res.status).to.eql(200);
      expect(res.body.msg).to.eql('User ' + userId + ' has been deleted.');
      done();
    });
  });

  after((done) => {
    mongoose.connection.db.dropDatabase(() => {
      done();
    });
  });  

});
