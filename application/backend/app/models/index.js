const mongoose = require('mongoose');
const User = require('./User');
const Ballots = require('./Ballot');

mongoose.Promise = global.Promise;
const db = {};
db.mongoose = mongoose;
db.user = User
db.ballots = Ballots

module.exports = db;