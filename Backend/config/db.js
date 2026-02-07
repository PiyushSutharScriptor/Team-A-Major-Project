const mongoose = require('mongoose')

const connectDb = async(req,res)=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB Connected")
    }
    catch(err){
        console.error("Error in connecting database" , err)
    }
}

module.exports = connectDb;