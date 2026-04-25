const user = require('../models/userModel')
const jwt = require('jsonwebtoken')

const auth = async(req,res,next)=>{
    try{
        const gtoken = req.headers.authorization

        if(gtoken==null){
            return res.status(400).json({
                message:"Token not found"
            })
        }

        const token = gtoken.split(" ")[1];
        const validUser = await jwt.verify(token, process.env.JWT_SECRET)

        if(validUser!=null){
            const findUser = await user.findById(validUser._id)

            if(findUser==null){
                return res.status(400),json({
                    message:"User not found (middleware)"
                })
            }
            else{
                req.user = findUser
                next()
            }
        }
        else{
            res.status(400),json({
                message:"Token has expired"
            })
        }
    }
    catch(err){
        res.status(500).json({
            message:"Error in middleware passing",
            error :err
        })
    }
}

module.exports = auth;