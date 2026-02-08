const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const userRouter = require('./routes/userRoutes')

dotenv.config();

const app = express();
app.use(express.json())
connectDB()

app.use('/user',userRouter);

app.get('/' , (req,res)=>{
    res.send("Home Page")
})

app.listen(process.env.PORT, ()=>{
    console.log("Server Running")
})
