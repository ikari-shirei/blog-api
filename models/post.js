var mongoose = require('mongoose')

var Schema = mongoose.Schema

var PostSchema = new Schema({
  img: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    maxLength: 50,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  isPublished: { type: Boolean, default: true },
})

// Virtual for post's URL
PostSchema.virtual('url').get(function () {
  return '/post/' + this._id
})

//Export model
module.exports = mongoose.model('Post', PostSchema)
