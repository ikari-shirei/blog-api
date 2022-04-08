const User = require('../models/user')
const Post = require('../models/post')
const Comment = require('../models/comment')

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

      newComment.save(function (err, savedComment) {
        if (err) {
          return next(err)
        }

        Post.findById(req.params.id).exec(function (err, targetPost) {
          if (err) {
            return next(err)
          }

          let newPost = new Post({
            _id: targetPost._id,
            comments: [...targetPost.comments, savedComment._id],
          })

          Post.findByIdAndUpdate(targetPost._id, newPost, function (err) {
            if (err) {
              return next(err)
            }

            res.json({ post: newPost, comments: newPost.comments })
          })
        })
      })
    }
  },
]
/*
 */
