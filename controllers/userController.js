const User = require('../models/user')
const Post = require('../models/post')

const async = require('async')
const { body, validationResult } = require('express-validator')

var bcrypt = require('bcryptjs')
require('dotenv').config()

const jwt = require('jsonwebtoken')

exports.auth = function (req, res, next) {
  res.json({ user: req.user })
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
      res.status(400).json(errors.array())
    } else {
      User.findOne({ email: req.body.email }).exec(function (err, user) {
        if (err) {
          return next(err)
        }

        bcrypt.compare(req.body.password, user.password, (err, result) => {
          if (err) {
            return next(err)
          }

          // Password or email is wrong
          if (!result) {
            res.status(401)
            const newErr = new Error('Wrong email or password.')
            return next(newErr)
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
      res.status(400).json(errors.array())
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

exports.user_bookmark_post = [
  body('post_id').trim().escape(),

  function (req, res, next) {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.status(400).json(errors.array())
      return
    } else {
      // Find post
      Post.findById(req.body.post_id).exec(function (err, result) {
        if (err) {
          return next(err)
        }

        // Find user
        User.findById(req.user._id)
          .populate('bookmarks')
          .exec(function (err, user) {
            if (err) {
              return next(err)
            }

            // Add or remove bookmarked post to users bookmark collection
            let newUser = {
              _id: user._id,
            }

            // Check if this post exist or not as a bookmark
            const isExist = user.bookmarks.every((bookmark) => {
              return String(bookmark._id) !== String(result._id)
            })

            // If it doesn't exist add it
            if (isExist) {
              newUser.bookmarks = [...user.bookmarks, result]
            } else {
              // If it exist, remove it
              newUser.bookmarks = user.bookmarks.filter((bookmark) => {
                return String(bookmark._id) !== String(result._id)
              })
            }

            // Update user
            User.findByIdAndUpdate(req.user, newUser, function (err) {
              if (err) {
                return next(err)
              }

              // Send result
              res.status(200).json({
                msg: 'Bookmark is saved',
              })
            })
          })
      })
    }
  },
]

exports.user_like_post = [
  body('post_id').trim().escape(),

  function (req, res, next) {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.status(400).json(errors.array())
      return
    } else {
      Post.findById(req.body.post_id).exec(function (err, targetPost) {
        if (err) {
          return next(err)
        }

        const isLikeExist = targetPost.likes.some((like) => {
          return String(like) === String(req.user._id)
        })

        const newPost = {
          _id: targetPost._id,
        }

        if (!isLikeExist) {
          newPost.likes = [...targetPost.likes, req.user._id]
        } else {
          newPost.likes = targetPost.likes.filter((like) => {
            return String(like) !== String(req.user._id)
          })
        }

        Post.findByIdAndUpdate(targetPost._id, newPost, function (err) {
          if (err) {
            return next(err)
          }

          console.log(targetPost, newPost)
          res.status(200).json({
            msg: 'Like added / removed',
          })
        })
      })
    }
  },
]

exports.user_bookmarks_get = function (req, res, next) {
  User.findById(req.user._id)
    .populate('bookmarks')
    .exec(function (err, result) {
      if (err) {
        return next(err)
      }

      res.json({ bookmarks: result.bookmarks })
    })
}

exports.user_comments_get = function (req, res, next) {
  User.findById(req.user._id)
    /*  .populate('comments') */
    .exec(function (err, result) {
      if (err) {
        return next(err)
      }
      console.log(result, 'resulto')
      res.json({ comments: result.comments })
    })
}

exports.user_delete_delete = function (req, res, next) {
  res.json({ user_delete_delete: 'not implemented' })
}
