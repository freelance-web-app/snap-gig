'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const User = require(__dirname + '/../models/users-schema');
const http = require('http');
const fs = require('fs');

module.exports = (publicRouter) => {
  publicRouter.route('/user')
    .post((req, res) => {
      req.on('data', (data) => {
        req.body = JSON.parse(data);
        console.log('INCOMING MOCHA DATA : ', req.body);
        console.log(req.body);
        let newUser = new User(req.body);
        newUser.save((err, user) => {
          if (err) {
            res.status(404).json({msg: 'Username already exists'});
            res.end();
          } else {
            res.status(200);
            res.json(user);
            res.end();
          };
        });
      });
    });

    publicRouter.route('/user/:id')
    .put((req, res) => {
      req.on('data', (data) => {
        req.body = JSON.parse(data);
        User.update({_id: req.params.id}, req.body, (err, user) => {
          if (err) {
            res.status(404).json({msg: 'User not found'});
            res.end();
          }
          res.status(200);
          res.json(user);
          res.end();
        });
      });
    })
    .delete((req, res) => {
      User.findById(req.params.id, (err, user) => {
        if (err) {
          res.status(404).json({msg: 'User not found'});
          res.end();
        }
        user.remove((err, user) => {
          if (err) {
            res.status(404).json({msg: 'User coundn\'t be deleted'});
            res.end();
          }
          res.status(200);
          res.json({msg: 'User ' + req.params.id + ' has been deleted.'});
          res.end();
        });
      });
    });
  };
