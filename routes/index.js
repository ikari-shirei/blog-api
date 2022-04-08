var express = require('express')
var router = express.Router()

const userController = require('../controllers/userController')
const postController = require('../controllers/postController')
const commentController = require('../controllers/commentController')

const passport = require('passport')

require('../config/passport')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

/* USER */

// Auth
router.get(
  '/auth',
  passport.authenticate('jwt', { session: false }),
  userController.auth
)

// Login post
router.post('/login', userController.user_login_post)

// Register post
router.post('/register', userController.user_register_post)

// Get user bookmarks
router.get(
  '/user/:id/bookmarks', // user id bookmarks
  passport.authenticate('jwt', { session: false }),
  userController.user_bookmarks_get
)

// Get user comments
router.get(
  '/user/:id/comments',
  passport.authenticate('jwt', { session: false }),
  userController.user_comments_get
)

// Account delete
router.delete('/delete-account', userController.user_delete_delete)

/* POST */

// Get all posts
router.get('/posts', postController.all_post_get)

// Get required post
router.get('/post/:id', postController.selected_post_get)

// Add or remove bookmark post post
router.post(
  '/post/:id/bookmark',
  passport.authenticate('jwt', { session: false }),
  userController.user_bookmark_post
)

// Add or remove like post post
router.post(
  '/post/:id/like',
  passport.authenticate('jwt', { session: false }),
  userController.user_like_post
)

/* COMMENT */

// Add comment post
router.post(
  '/post/:id/comment',
  passport.authenticate('jwt', { session: false }),
  commentController.comment_add_post
)

module.exports = router
