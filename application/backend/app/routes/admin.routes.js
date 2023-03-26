require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4 } = require('uuid');
const jsonwebtoken = require('jsonwebtoken');
const authJwt = require('../middlewares/authJwt');
const db = require("../models");
const Ballots = db.ballots;
const secretKey = process.env.SECRET_KEY;

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post('/admin/ballots/create', [authJwt.verifyToken], function (req, res) {
    const { title, description, candidates, duration } = req.body;
    const newBallot = new Ballots({
      title, description, candidates: candidates.map(item => ({...item, id:v4() })), duration,
      status: req.body.status || 'ongoing',
    })

    newBallot.save().then(() => {
      res.send({ status: 1, ballotId:newBallot._id.toString(), message: "New service created successfully!" });
    }).catch((err) => {
      res.send({ status: 0, message: err });
    })
  })

  app.post('/admin/ballots/complete', [authJwt.verifyToken, authJwt.isAdmin], function(req, res) {
    Ballots.findOne({ _id: req.body.ballotId }).exec().then((ballot) => {
      if(ballot && ballot.status) {
        ballot.status = 'completed';
        ballot.save().then(() => {
          return res.send({ status: 1, message: "Ballot updated", data: ballot });
        }).catch(err => res.send({ status: 0, message: err }));
      }
    })
  })
  app.post('/admin/ballots/vote', [authJwt.verifyToken], function(req, res) {
    Ballots.findOne({ _id: req.body.ballotId }).exec().then((ballot) => {
      if(ballot) {
        const candidates = ballot.candidates.map(function(candidate) {
          if(candidate.id === req.body.candidateId) {
            candidate.votes = parseInt(candidate.votes) + 1;
          }
          return candidate;
        })
        ballot.candidates = candidates;
        ballot.updateOne(ballot).then(() => {
          return res.send({ status: 1, message: 'You have successfully voted' });
        }).catch(err => res.send({ status: 0, message: err }));
      }
    })
  })

  app.post('/admin/ballots/delete', [authJwt.verifyToken, authJwt.isAdmin], function (req, res) {
    Ballots.findOne({ _id: req.body.ballotId }).exec().then((ballot) => {
      if(ballot) {
        Ballots.deleteOne({ _id: req.body.ballotId }).exec().then(() => {
          res.send({ status: 1, message: 'Ballot deleted successfully' });
        }).catch(err => {
          if(err) res.send({ status: 0, message: err })
        })
      }
    })
  })
}