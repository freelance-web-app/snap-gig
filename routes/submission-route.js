'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const Submission = require(__dirname + '/../models/submissions-schema');

module.exports = (apiRouter) => {
  apiRouter.route('/submission/:id')
    .get((req, res) => {
      if(JSON.stringify(req.params.id) === JSON.stringify(req.user.submissions)) {
        Submission.findById(req.params.id, (err, sub) => {
          if(err) {
            res.status(400).json({msg: 'GET error: ' + err})
            res.end();
          }
          res.status(200).json({data: sub})
          res.end();
        })
      } else {
        res.status(404).json({msg: 'You do not have permission to view this submission!'});
      }
    })

    .put((req, res) => {
      req.on('data', (data) => {
        req.body = JSON.parse(data);
        if (JSON.stringify(req.params.id) === JSON.stringify(req.user.submissions)) {
          Submission.update({_id: req.params.id}, req.body, (err, sub) => {
            if (err) {
              res.status(404).json({msg: 'PUT err: ' + err});
              res.end();
            }
            res.status(200).json({data: req.body});
            res.end();
          });
        } else {
          res.status(404).json({msg: 'You do not have permission to edit this submission!'});
        }
      });
    })

    .delete((req, res) => {
      if (JSON.stringify(req.params.id) === JSON.stringify(req.user.submissions)) {
        Submission.findById(req.params.id, (err, sub) => {
          if (err) {
            res.status(404).json({msg: 'DELETE error: ' + err});
            res.end();
          }
          sub.remove((err, sub) => {
            if (err) {
              res.status(404).json({msg: 'User coundn\'t be deleted'});
              res.end();
            }
            res.status(200).json({msg: 'User ' + req.params.id + ' has been deleted.'});
            res.end();
          });
        });
      } else {
        res.status(404).json({msg: 'You do not have permissions to delete this user!'});
        res.end();
      }
    });
};
