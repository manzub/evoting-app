require('dotenv').config();
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const db = require("../models");
const User = db.user;
const secretKey = process.env.SECRET_KEY;

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post('/auth/signin', function(req, res) {
    User.findOne({ email: req.body.email }).exec().then((user) => {
      // user not found
      if(!user) return res.send({ status: 0, message: "User Not found." });
      // password is valid
      var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
      if(!passwordIsValid) return res.send({ status:0, message: 'Invalid password' })
      // proceed signin
      const token = jsonwebtoken.sign({ id: user._id, email: user.email }, secretKey, { expiresIn: 86400 });
      const { email, address, firstname, lastname, _id:id, role } = user;
      res.send({ status: 1, message: 'Login Successful', user: {email, address, firstname, lastname, id, accessToken: token, role} })
    }).catch(err => {
      if (err) return res.send({ status: 0, message: err.message })
    })
  })

  app.post('/auth/user-token', function(req, res) {
    jsonwebtoken.verify(req.body.token, secretKey, (err, decoded) => {
      if (err) return res.send({ status: 0, message: err.message });

      User.findOne({ email: decoded.email }).exec((err, user) => {
        if (err) return res.send({ status: 0, message: err.message })
        // user not found
        if(!user) return res.send({ status: 0, message: "User Not found." });
        // proceed
        const { email, username, _id } = user;
        res.send({ status: 1, accessToken: req.body.token, email, username, _id })
      })
    })
  })

  app.post('/auth/signup', function(req, res) {
    let salt = Math.floor(Math.random() * 10);
    const user = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      address: req.body.address,
      password: bcrypt.hashSync(req.body.password, salt),
    })

    user.save().then(user => {
      user.role = req.body.role || 2;
      if([1,2,3].includes(user.role)) {
        user.save().then(() => {
          res.send({ status: 1, message: "Registration Successfull" })
        }).catch((err) => res.send({ status: 0, message: 'Could not update user roles' }))
      }
    }).catch((err) => res.send({ status: 0, message: 'Could not create new user' }));
  })
}