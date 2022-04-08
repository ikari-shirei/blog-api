const Post = require('../models/post')

exports.all_post_get = function (req, res, next) {
  Post.find().exec(function (err, results) {
    if (err) {
      next(err)
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
        next(err)
      }

      // Successful
      res.json({ post: result })
    })
}
