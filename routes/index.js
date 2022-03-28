var express = require('express')
var router = express.Router()

const userController = require('../controllers/userController')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

/* USER */

// Login get
router.get('/login', userController.user_login_get)

// Login post
router.post('/login', userController.user_login_post)

// Register get
router.get('/register', userController.user_register_get)

// Register post
router.post('/register', userController.user_register_post)

// Profile get
router.get('/profile', userController.user_profile_get)

// Account delete get
router.get('/delete-account', userController.user_delete_get)

// Account delete
router.delete('/delete-account', userController.user_delete_delete)

module.exports = router
