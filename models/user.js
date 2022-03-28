var mongoose = require('mongoose')

var Schema = mongoose.Schema

var UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    maxLength: 20,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    maxLength: 100,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    maxLength: 20,
    minlength: 3,
    trim: true,
  },
  isAdmin: {
    type: Boolean,
    required: false,
    default: false,
  },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
})

//Export model
module.exports = mongoose.model('User', UserSchema)
