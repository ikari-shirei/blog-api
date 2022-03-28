var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

var compression = require('compression')
var helmet = require('helmet')

const mongoose = require('mongoose')
require('dotenv').config()

var indexRouter = require('./routes/index')

var app = express()

/* mongoDB */

const mongoDb = process.env.DB_URI

mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true })
const db = mongoose.connection

db.on('error', console.error.bind(console, 'mongo connection error'))
mongoose.connection.readyState === 2 ? console.log('MongoDB connected') : ''

/* Middlewares */

app.use(compression())
app.use(helmet())

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)

module.exports = app
