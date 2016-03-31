'use strict';

let mongoose = require('mongoose');

let gigSchema = new mongoose.Schema ({
  name: {type: String, required: true},
  category: String,
  description: {type: String, required: true},
  deadline: Date,
  payment_range: Number,
  owner: [{type:mongoose.Schema.Types.ObjectId, ref: 'User'}],
  submissions: [{type:mongoose.Schema.Types.ObjectId, ref: 'Submission'}],
  winner: [{type:mongoose.Schema.Types.ObjectId, ref: 'User', default: null}]
});

module.exports = mongoose.model('Gig', gigSchema)
