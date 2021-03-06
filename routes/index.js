var express = require('express')
var router = express.Router()

const userController = require('../controllers/userController')
const postController = require('../controllers/postController')
const commentController = require('../controllers/commentController')

const passport = require('passport')

require('../config/passport')

/* GET home page. */
router.get('/', function (req, res) {
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

/* POST */

// Get all posts
router.get('/posts', postController.published_posts_get)

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

// Admin create post
router.post(
  '/admin/post',
  passport.authenticate('jwt', { session: false }),
  postController.admin_post_create_post
)

// Admin get non published posts
router.get(
  '/admin/posts',
  passport.authenticate('jwt', { session: false }),
  postController.admin_all_posts_get
)

router.post(
  '/admin/post/:id/delete',
  passport.authenticate('jwt', { session: false }),
  postController.admin_post_delete
),
  // Admin publish unpublish
  router.post(
    '/admin/post/:id/publish',
    passport.authenticate('jwt', { session: false }),
    postController.admin_publish_post
  ),
  router.post(
    '/admin/post/:id/unpublish',
    passport.authenticate('jwt', { session: false }),
    postController.admin_unpublish_post
  ),
  /* COMMENT */

  // Add comment post
  router.post(
    '/post/:id/comment',
    passport.authenticate('jwt', { session: false }),
    commentController.comment_add_post
  )

module.exports = router
