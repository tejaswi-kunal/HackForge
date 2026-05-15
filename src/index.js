require('dotenv').config();
const express=require('express');
const main=require('./config/db');
const cookieParser=require('cookie-parser');
const authRouter=require('./router/auth');
const redisClient=require('./config/redis');
const ProblemRouter=require('./router/problem');



// app initialization
// conataining all the prebuilt intializations of the apis 
const app=express();

// parser
app.use(express.json());
app.use(cookieParser());

// authentication
app.use('/auth',authRouter);

// problem
app.use('/problem',ProblemRouter);


// connection initialization
const intializeConnection=async()=>{
    try{
        await main()
        console.log("MongoDB Connected");

        await redisClient.connect()
        console.log("Redis Connected");

        app.listen(process.env.PORT,()=>{
            console.log("Listening At Port 3000");
        })
    }catch(err){
        console.log(err);
    }
}

intializeConnection();

