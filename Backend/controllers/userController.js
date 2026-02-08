const user = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.signup = async(req,res)=>{
    try{
        const data = req.body;
        if(!data.username || !data.email || !data.password){
            res.status(400).json({
                message:"usename, email and password are required"
            })
        }

        const findUser = await user.findOne({email:data.email})
        if(findUser==null){
            const salt = await bcrypt.genSalt(10)
            const hash = await bcrypt.hash(data.password,salt)

            data.password = hash
            const newUser = await user.create(data);
            res.status(200).json({
                message:"User signup successfully"
            })
        }
        else{
            res.status(400).json({
                message:"User already exists"
            })
        }
    }
    catch(err){
        res.status(500).json({
            message:"Error in user signup",
            error:err
        })
    }
}

exports.login = async(req,res)=>{
    try{
        const data = req.body;

        if(!data.email || !data.password){
            return res.status(400).json({
                message:"email and password are required"
            })
        }

        const findUser = await user.findOne({email:data.email})
        if(findUser!=null){
            const pass = await bcrypt.compare(data.password,findUser.password)

            if(pass){
                const token = await jwt.sign(
                    {_id:findUser._id},
                    process.env.JWT_SECRET,
                    {expiresIn:"1d"}
                )

                res.status(200).json({
                    message:"User login successfully",
                    token:token
                })
            }
            else{
                res.status(400).json({
                    message:"Enter correct password"
                })
            }
        }
        else{
            return res.status(400).json({
                message:"User already exists"
            })
        }
    }
    catch(err){
        res.status(500).json({
            message:"Error in user login",
            error:err
        })
    }
}
