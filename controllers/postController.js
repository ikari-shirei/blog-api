const Post = require('../models/post')
const User = require('../models/user')
const async = require('async')
const { body, validationResult } = require('express-validator')
const user = require('../models/user')

// Users get only published posts
exports.published_posts_get = function (req, res, next) {
  Post.find({ isPublished: true }).exec(function (err, results) {
    if (err) {
      return next(err)
    }

    // Successful
    res.json({ posts: results })
  })
}

exports.selected_post_get = function (req, res, next) {
  Post.findById(req.params.id)
    .populate({
      path: 'comments',
      populate: { path: 'user' },
    })
    .exec(function (err, result) {
      if (err) {
        return next(err)
      }

      // Successful
      if (result.isPublished) {
        res.json({ post: result })
      } else {
        return next(new Error('Not authorized'))
      }
    })
}

exports.admin_post_create_post = [
  body('title').trim().escape(),
  body('message').escape(),
  body('isPublished').escape(),

  function (req, res, next) {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.status(400).json(errors.array())
      return
    } else {
      User.findById(req.user._id).exec(function (err, targetUser) {
        if (err) {
          return next(err)
        }

        if (targetUser.isAdmin) {
          const newPost = new Post({
            img: req.body.img,
            title: req.body.title,
            message: req.body.message,
            isPublished: req.body.isPublished,
          })

          newPost.save(function (err) {
            if (err) {
              return next(err)
            }

            // Post saved
            res.json({ msg: 'Post saved', post: newPost })
          })
        } else {
          res.status(403).json({ msg: 'Forbidden' })
        }
      })
    }
  },
]

exports.admin_all_posts_get = function (req, res, next) {
  async.series(
    {
      posts: function (cb) {
        Post.find().exec(cb)
      },
      user: function (cb) {
        User.find({ _id: req.user._id, isAdmin: true }).exec(cb)
      },
    },
    function (err, results) {
      if (err) {
        return next(err)
      }

      const admin = results.user[0]

      if (admin) {
        res.json({ posts: results.posts })
      } else {
        res.status(403).json({ msg: 'Unauthorized' })
      }
    }
  )
}
