var express = require('express')
var router = express.Router()

const userController = require('../controllers/userController')
const postController = require('../controllers/postController')

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

// Add bookmark post post
router.post(
  '/post/:id/bookmark',
  passport.authenticate('jwt', { session: false }),
  userController.user_bookmark_post
)

// Add bookmark post post
router.get(
  '/profile/bookmarks',
  passport.authenticate('jwt', { session: false }),
  userController.user_bookmarks_get
)

// Account delete
router.delete('/delete-account', userController.user_delete_delete)

/* POST */

// Get all posts
router.get('/posts', postController.all_post_get)

// Get required post
router.get('/post/:id', postController.selected_post_get)

module.exports = router
