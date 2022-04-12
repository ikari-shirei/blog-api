const Post = require('../models/post')
const Comment = require('../models/comment')

const async = require('async')

const { body, validationResult } = require('express-validator')

exports.comment_add_post = [
  body('message')
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage('Comment must be specified.')
    .isLength({ max: 1000 })
    .withMessage('Comment must be under 1000 chars.'),

  function (req, res, next) {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.status(400).json(errors.array())
      return
    } else {
      // Validated
      let newComment = new Comment({
        message: req.body.message,
        user: req.user._id,
      })

      async.waterfall(
        [
          // Save new comment
          function (cb) {
            newComment.save(function (err, savedComment) {
              cb(err, savedComment)
            })
          },
          // Find post
          function (savedComment, cb) {
            Post.findById(req.params.id).exec(function (err, targetPost) {
              let newPost = new Post({
                _id: targetPost._id,
                comments: [...targetPost.comments, savedComment._id],
              })

              cb(err, targetPost, newPost)
            })
          },
          // Update post
          function (targetPost, newPost, cb) {
            Post.findByIdAndUpdate(
              targetPost._id,
              newPost,
              function (err, result) {
                cb(err, result, newPost)
              }
            )
          },
        ],

        function (err, result, newPost) {
          if (err) {
            return next(err)
          }

          res.json({ post: newPost, comments: newPost.comments.reverse() })
        }
      )
    }
  },
]
