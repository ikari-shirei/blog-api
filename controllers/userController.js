const User = require('../models/user')

const async = require('async')
const { body, validationResult } = require('express-validator')

var bcrypt = require('bcryptjs')
require('dotenv').config()

const jwt = require('jsonwebtoken')

exports.user_login_get = function (req, res, next) {
  res.json({ user_login_get: 'not implemented ' })
}

exports.user_register_get = function (req, res, next) {
  res.json({ user_register_get: 'not implemented' })
}

exports.user_login_post = [
  body('email')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Email must be specified.')
    .isEmail()
    .withMessage('Email must be valid.')
    .custom(async (email) => {
      const isEmail = await User.findOne({ email: email })

      if (!isEmail) {
        throw new Error("This email isn't registered.")
      }
    }),

  body('password')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Password must be specified.')
    .isLength({ min: 3 })
    .withMessage('Password must be over 3 characters.'),

  (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.json(errors.array())
    } else {
      User.findOne({ email: req.body.email }).exec(function (err, user) {
        if (err) {
          return next(err)
        }

        bcrypt.compare(req.body.password, user.password, (err) => {
          if (err) {
            return next(err)
          }

          // User logged in succesfully, send token
          const tokenInfo = { username: user.username, email: user.email }

          const opts = { expiresIn: '1 hour' }
          const secret = process.env.TOKEN_KEY
          const token = jwt.sign({ tokenInfo }, secret, opts)

          res.json({
            message: 'Logged in',
            token,
          })
        })
      })
    }
  },
]

exports.user_register_post = [
  body('username')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Username must be specified.')
    .isLength({ min: 3 })
    .withMessage('Username at least must be 3 character.')
    .custom(async (username) => {
      const isUsername = await User.findOne({ username: username })

      if (isUsername) {
        throw new Error('Username in use.')
      }
    }),
  body('email')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Email must be specified.')
    .isEmail()
    .withMessage('Email must be valid.')
    .custom(async (email) => {
      const isEmail = await User.findOne({ email: email })

      if (isEmail) {
        throw new Error('Email in use.')
      }
    }),
  body('password')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Password must be specified.')
    .isLength({ min: 3 })
    .withMessage('Password must be over 3 characters.')
    .custom((password, { req }) => {
      if (password !== req.body.rpassword) {
        return false
      } else {
        return true
      }
    })
    .withMessage('Passwords must match.'),

  (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.json(errors.array())
      return
    } else {
      bcrypt.hash(req.body.password, 10, function (err, hash) {
        if (err) {
          return next(err)
        }

        const newUser = new User({
          username: req.body.username,
          email: req.body.email,
          password: hash,
          isAdmin: false,
          comments: [],
          bookmarks: [],
        })

        newUser.save(function (err) {
          if (err) {
            return next(err)
          }

          // User registered successfully
          res.json(newUser)
        })
      })
    }
  },
]

exports.user_profile_get = function (req, res, next) {
  res.json({ user_profile_get: 'not implemented' })
}

exports.user_delete_get = function (req, res, next) {
  res.json({ user_delete_get: 'not implemented' })
}

exports.user_delete_delete = function (req, res, next) {
  res.json({ user_delete_delete: 'not implemented' })
}
