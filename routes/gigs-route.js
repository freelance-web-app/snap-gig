'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const jwtAuth = require(__dirname + '/../lib/authentication');
const Gig = require(__dirname + '/../models/gigs-schema');
const Sub = require(__dirname + '/../models/submissions-schema');
const User = require(__dirname + '/../models/users-schema');
const AWS = require('aws-sdk');
let s3 = new AWS.S3();
let Twitter = require('twitter');
require('dotenv').load();

var tweetClient = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var nodeMailer = require('nodemailer');
var mailer = require(__dirname + '/../lib/email-module');

module.exports = (apiRouter) => {
  apiRouter.route('/gigs')
    .get((req, res) => {
      Gig.find({}).populate('owner').populate('submissions').exec((err, gigs) => {
        if(err) throw err;
        res.status(200).json({msg: gigs});


        res.end();
      });
    })
    .post((req, res) => {
      req.on('data', (data) => {
        let userInfo = req.user._id;
        req.body = JSON.parse(data);
        var newGig = new Gig(req.body);
        newGig.save((err, gig) => {
          if(err) throw err;
          User.findByIdAndUpdate(userInfo, { $push: {gigs: gig._id}}, (err, user) => {
            if (err) throw err;
          })
          Gig.findByIdAndUpdate(gig._id, { $push: {owner: userInfo}}, (err, user) => {
            if (err) throw err;
          })
          mailer.gig(req.user.email, req.body.name, req.user.username, req.body.deadline, gig, (err, info) => {
            if (err) throw err;
          })

          let tweet = 'Psst, we have a new gig. Search for ' + req.body.name + ' and submit!';

          tweetClient.post('statuses/update', {status: tweet}, function (error, tweets, response) {
            if (err) throw err;
            console.log(tweets);
            // console.log(response);
          });

          res.json({data: gig})
          res.end();
        })
      })
    })

  apiRouter.route('/gigs/:id')
    .get((req, res) => {
      Gig.findById(req.params.id, (err, gig) => {
        if (err) {
          res.status(400).json({msg: 'Couldn\'t find gig'});
        }
        res.status(200).json({data: gig});
        res.end()
      })
    })
    .put((req, res) => {
      let userInfo = req.user._id;
      Gig.findById(req.params.id, (err, gig) => {
        if (err) throw err;
        if (JSON.stringify(gig.owner[0]) == JSON.stringify(userInfo)) {
          gig.update(req.body, (err, data) => {
            if (err) throw err;
            res.status(200).json({msg: 'gig updated!', data: req.body})
            res.end();
          })
        } else {
          res.status(404).json({msg: 'You do not have permissions to patch this gig!'});
          res.end();
        };
      });
    })
    .delete((req, res) => {
      let userInfo = req.user._id;
      Gig.findById(req.params.id, (err, gig) => {
        if (err) throw err;
        if (JSON.stringify(gig.owner[0]) == JSON.stringify(userInfo)) {
          gig.remove((err, gig) => {
            res.status(200).json({msg: 'gig removed!!'})
          });
        } else {
          res.status(400).json({msg: 'you dont have permission to delete this user'});
        };
      });
  });

  apiRouter.route('/gigs/:id/submissions')
    .post((req, res) => {
      req.on('data', (data) => {
        var newBody;
        req.body = JSON.parse(data);
        let newSub = new Sub(req.body);
        let globalSubmitId;

        newSub.save((err, submission) => {
          if (err) {
            res.json({error: err});
            res.end();
          }
          let submissionId = submission._id;
          let gigOwnerId;
          let gigUserEmail;
          let gigUserName;
          let gigName;
          let gigOwner;
          globalSubmitId = submission._id;
          Gig.findByIdAndUpdate(req.params.id, {$push: {submissions: submissionId}}, (err, gig) => {
            if (err) {
              res.status(404).json({msg: 'Invalid Submission when finding gig by id'});
              res.end();
            }
            gigName = gig.name
            gigOwnerId = gig.owner[0];
          });

          User.findOne({id: gigOwnerId}, (err, user) => {
            if (err) throw err;
            gigOwner = user.username
            gigUserEmail = user.email;
          })

          User.findByIdAndUpdate(req.user._id, {$push: {submissions: submissionId}}, (err, subId) => {
            mailer.submission(gigUserEmail, submission.name, req.user.username, gigName, gigOwner, (err, info) => {
              if (err) throw err;
            })
            if (err) {
              res.status(404).json({msg: 'Invalid Submission when finding user'});
              res.end();
            }
          })

          let docBody = fs.createReadStream(__dirname + submission.path);
          let s3obj = new AWS.S3({params: {Bucket: 'snap-gig-gig-bucket-dump', Key: req.body.name, ACL: 'public-read-write'}});
          s3obj.upload({Body: docBody})
          .on('httpUploadProgress', function(evt) {
          })
          .send(function(err, data) {
          });

          s3.getSignedUrl('getObject', {Bucket: 'snap-gig-gig-bucket-dump', Key: req.body.name}, (err, url) => {
            if (err) throw err;
            Sub.findByIdAndUpdate(globalSubmitId, {$push: {files: url}}, (err, sub) => {
              if (err) {
                res.status(404).json({msg: 'File URL was not pushed to submission schema'});
                res.end();
              }
            });
          });
          res.status(200).json({sub: submission, msg: 'Email verification sent and file uploaded to S3'});
          res.end(); //originally found above s3.getSignedUrl
        });
      });
    });
};
