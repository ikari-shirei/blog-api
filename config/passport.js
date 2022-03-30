const User = require('../models/user')
require('dotenv').config()
const passport = require('passport')

var JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = process.env.TOKEN_KEY

passport.use(
  new JwtStrategy(opts, function (jwt_payload, done) {
    User.findOne({ email: jwt_payload.tokenInfo.email }, function (err, user) {
      if (err) {
        return done(err, false)
      }

      if (user) {
        return done(null, user)
      } else {
        return done(null, false)
      }
    })
  })
)
