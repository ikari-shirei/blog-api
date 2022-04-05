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
