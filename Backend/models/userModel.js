const mongoose = require('mongoose')

const UserModel = new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            trim:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true
        },
        password:{
            type:String,
            required:true
        }

    },
    {timestamps:true}
)

const user = mongoose.model('user' , UserModel)
module.exports = user