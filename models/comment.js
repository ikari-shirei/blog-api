var mongoose = require('mongoose')

var Schema = mongoose.Schema

var CommentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: {
    type: String,
    required: true,
    maxLength: 1000,
  },
  timestamp: { type: Date, default: Date.now },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
})

//Export model
module.exports = mongoose.model('Comment', CommentSchema)
