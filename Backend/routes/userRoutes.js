const { login, signup }  = require('../controllers/userController')
const express = require('express')

const userRouter = express.Router()

userRouter.post('/login', login)
userRouter.post('/signup', signup)

module.exports = userRouter