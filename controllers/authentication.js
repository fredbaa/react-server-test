const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../config');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = function(req, res, next) {
  return res.json({ token: tokenForUser(req.user) });
}

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(422).send({error: "You must supply email and password."});
  }

  User.findOne({ email: email }, function(err, existingUser) {
    if (err) { return next(err); } // any db error

    // if email already exists
    if (existingUser) {
      return res.status(422).send({ error: "Email already exist" })
    }

    const user = new User({
      email: email,
      password: password
    });

    user.save(function (err) {
      if (err) { return next(err) };

      return res.json({ token: tokenForUser(user) });
    });
  });
}
