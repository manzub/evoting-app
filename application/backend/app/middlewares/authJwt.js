require('dotenv').config();
const jsonwebtoken = require('jsonwebtoken');
const db = require("../models");

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res.send({ status: 2, message: "No token provided!" });
  }
  jsonwebtoken.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.send({ status: 2, message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
}

isAdmin = (req, res, next) => {
  db.user.findById(req.userId).exec().then((user) => {
    if(user.role === 1) {
      next();
      return;
    }
    res.send({ status: 2, message: "Require Admin Role!" });
    return;
  }).catch((err) => {
    res.send({ status: 2, message: err });
    return;
  })
}

const authJwt = {
  verifyToken,
  isAdmin
}
module.exports = authJwt;