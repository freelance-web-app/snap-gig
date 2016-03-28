'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const fs = require('fs');
const jwtAuth = require(__dirname + '/../lib/authentication');

const Gig = require(__dirname + '/../models/gigs-schema');

module.exports = (apiRouter) => {
  apiRouter.route('/gigs')
  .get((req, res) => {
    Gig.find({}).populate('owner').populate('submissions').exec((err, gigs) => {
      if(err) throw err
      console.log('GIGGGS FOUND : ', gigs);
      res.status(200).json(gigs)
      console.log('Showing all open gigs');
      res.end()
    })
  })
  .post((req, res) => {
    req.on('data', (data) => {
      req.body = JSON.parse(data)
      var newGig = new Gig(req.body)
      newGig.save((err, data) => {
        if(err) throw err
        res.status(200)
        console.log('Gig Added');
        res.end()
      })
    })
  })

  apiRouter.route('/gigs/:id')
  .get((req, res) => {
    Gig.findById(req.params.id, (err, gig) => {
      if (err) throw err
      res.json(gig)
      res.status(200)
      console.log('Showing Specific Gig');
      res.end()
    })
  })
  .patch((req, res) => {
    //edit gig posting if you are the gig manager
  })
  .delete((req, res) => {
    //delete gig posting if you are the gig manager
  })

  apiRouter.route('/gigs/:id/submissions')
  .post((req, res) => {
    //creates new submission schema entry, pushed submission ID to submissions array for specific gig
  })
}
