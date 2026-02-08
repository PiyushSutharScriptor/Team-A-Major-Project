const { login, signup }  = require('../controllers/userController')
const express = require('express')
const auth = require('../middleware/authMiddleware')

const userRouter = express.Router()

userRouter.post('/login', login)
userRouter.post('/signup', signup)

userRouter.post('/me' , auth , (req,res)=>{
    res.status(200).json({
        message:"middleware is working fine"
    })
})

module.exports = userRouter