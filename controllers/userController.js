const User = require('../models/user')
const Post = require('../models/post')
const Comment = require('../models/comment')

const { body, validationResult } = require('express-validator')

var bcrypt = require('bcryptjs')
require('dotenv').config()

const jwt = require('jsonwebtoken')
const async = require('async')

exports.auth = function (req, res) {
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
      return
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
      async.waterfall(
        [
          // Find post
          function (cb) {
            Post.findById(req.body.post_id).exec(function (err, result) {
              cb(err, result)
            })
          },
          // Find user
          function (result, cb) {
            User.findById(req.user._id)
              .populate('bookmarks')
              .exec(function (err, user) {
                // Add or remove bookmarked post to users bookmark collection
                let newUser = new User({
                  _id: user._id,
                })

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

                cb(err, newUser)
              })
          },
          // Update user bookmarks
          function (newUser, cb) {
            User.findByIdAndUpdate(req.user, newUser, function (err, result) {
              cb(err, result)
            })
          },
        ],
        function (err, result) {
          if (err) {
            return next(err)
          }

          console.log(result)

          // Send result
          res.status(200).json({
            msg: 'Bookmark is saved',
          })
        }
      )
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

        const newPost = new Post({
          _id: targetPost._id,
        })

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

      const legalBookmarks = result.bookmarks.filter(
        (bookmark) => bookmark.isPublished === true
      )

      res.json({
        bookmarks: legalBookmarks.reverse(),
      })
    })
}

exports.user_comments_get = function (req, res, next) {
  Comment.find({ user: req.user._id })
    .populate('user')
    .exec(function (err, result) {
      if (err) {
        return next(err)
      }

      res.json({ comments: result.reverse() })
    })
}
