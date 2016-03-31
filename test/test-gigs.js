'use strict'

let chai = require('chai');
let chaiHTTP = require('chai-http');
chai.use(chaiHTTP);
let expect = chai.expect;
let request = chai.request;
let mongoose = require('mongoose');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let User = require(__dirname + '/../models/users-schema');
let Gig = require(__dirname + '/../models/gigs-schema');

process.env.MONGOLAB_URI = 'mongodb://localhost/testdb'
require(__dirname + '/../server');
let gigId;
let userId;
let testToken;

describe('Testing for creating a new user, /public/user. ', () => {
  it('Expect POST a new user and save to db', (done) => {
    request('localhost:3000')
    .post('/public/user')
    .send('{"username":"AlienBrain", "password":"123asd", "firstName":"Dwight", "lastName":"Shrute", "occupation":"Alien Hunter", "email":"alienbrain@gmail.com"}')
    .end((err, res) => {
      userId = res.body._id
      expect(err).to.eql(null);
      expect(res.status).to.eql(200);
      expect(res.body.username).to.eql('AlienBrain');
      expect(res.body.email).to.eql('alienbrain@gmail.com');
      done();
    })
  })
})

describe('Testing logging in verification at /login/login. ', () => {
  it('Expect login with correct user credentials, with status 200 and receives token', (done) => {
    request('localhost:3000')
    .post('/login/login')
    .auth('AlienBrain', '123asd')
    .end((err, res) => {
      testToken = res.body.token;
      expect(res.status).to.eql(200);
      expect(res.body).to.have.property('token');
      done();
    })
  })
})

describe('Testing /api/gigs rest routes. ', () => {
  it('expect POST to create a new gig.', (done) => {
    request('localhost:3000')
    .post('/api/gigs')
    .send('{"name":"weird graphic", "category":"Graphic Art", "description":"Create a graphic art peice that shows how weird that TA is", "deadline":"4-13-2016", "payment_range":1000}')
    .set('Authorization', 'token ' + testToken)
    .end((err, res) => {
      gigId = res.body.data._id;
      expect(err).to.eql(null);
      expect(res.status).to.eql(200);
      expect(res).to.be.json;
      expect(res.body.data.name).to.eql('weird graphic');
      expect(res.body.data.category).to.eql('Graphic Art');
      expect(res.body.data.description).to.eql('Create a graphic art peice that shows how weird that TA is');
      expect(res.body.data.deadline).to.eql('2016-04-13T07:00:00.000Z');
      expect(res.body.data.payment_range).to.eql(1000);
      done();
    })
  })

  it('Expect GET to /api/gigs to all gigs, with a status of 200 and a msg property with gig data.', (done) => {
    request('localhost:3000')
    .get('/api/gigs')
    .set('Authorization', 'token ' + testToken)
    .end((err, res) => {
      expect(err).to.eql(null);
      expect(res).to.be.json;
      expect(res.status).to.eql(200);
      expect(res.body).to.have.a.property('msg');
      done();
    })
  })
})

describe('Testing /gigs/:id. ', () => {
  it('expect GET, to specific ID, using the ID of the POST.', (done) => {
    request('localhost:3000')
      .get('/api/gigs/' + gigId)
      .set('Authorization', 'token ' + testToken)
      .end((err, res) => {
        expect(res.status).to.eql(200);
        expect(res.body.data.name).to.eql('weird graphic');
        expect(res.body.data.category).to.eql('Graphic Art');
        expect(res.body.data.description).to.eql('Create a graphic art peice that shows how weird that TA is');
        expect(res.body.data.deadline).to.eql('2016-04-13T07:00:00.000Z');
        expect(res.body.data.payment_range).to.eql(1000);
        done();
      })
  })

  it('expect PUT to edit category: monkey art, with the description "monkeys love bananas", and a payment of $1. ', (done) => {
    request('localhost:3000')
      .put('/api/gigs/' + gigId)
      .set('Authorization', 'token ' + testToken)
      .send({"name":"weird graphic", "category":"monkey art", "description":"monkeys love bananas", "deadline":"4-13-2016", "payment_range":1})
      .end((err, res) => {
        expect(err).to.eql(null);
        expect(res.status).to.eql(200);
        expect(res.body.data.category).to.eql('monkey art');
        expect(res.body.data.description).to.eql('monkeys love bananas');
        expect(res.body.data.payment_range).to.eql(1);
        expect(res.body.msg).to.eql('gig updated!');
        done();
      })
  })

  it('expect DELETE to remove gig, with a status of 200 and a message of gig removed!!', (done) => {
    request('localhost:3000')
      .delete('/api/gigs/' + gigId)
      .set('Authorization', 'token ' + testToken)
      .end((err, res) => {
        expect(err).to.eql(null);
        expect(res).to.be.json;
        expect(res.status).to.eql(200);
        expect(res.body.msg).to.eql('gig removed!!');
        done();
      })
  })
})

describe('Testing /api/gigs/:id/submissions', () => {
  before((done) => {
    let newGig = new Gig({"name":"Wizards Beard Logo Creation",
      "category":"Graphic Design",
      "description":"Make a new logo for Wizards Beard Coffee",
      "deadline":"April 4th 2016",
      "payment_range":400,
      "owner": userId})
      newGig.save((err, gig) => {
      })
      gigId = newGig._id
      console.log('this is gigId reassigned : ', gigId);
      done();
  })
//sub: submission, msg: 'Email verification sent and file uploaded to S3'
  it('expect POST to submission to have a status of 200, with sub property and a msg: \'Email verification sent and file uploaded to S3\'.', (done) => {
    request('localhost:3000')
      .post('/api/gigs/' + gigId + '/submisssions')
      .send({"path":"", "name":"magical beans", "body":""})
      .set('Authorization', 'token ' + testToken)
      .end((err, res) => {
        expect(err).to.eql(null);
        expect(res.status).to.eql(200);
      })
  })

  after((done) => {
    mongoose.connection.db.dropDatabase(() => {
      done();
    })
  })
})
