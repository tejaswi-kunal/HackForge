require('dotenv').config();
const express=require('express');
const main=require('./config/db');
const cookieParser=require('cookie-parser');
const authRouter=require('./router/auth');
const redisClient=require('./config/redis');
const ProblemRouter=require('./router/problem');
const submissionRouter=require('./router/submission');
const commentRouter=require('./router/comment');
const leaderboardRouter=require('./router/leaderboard');
const contestRouter=require('./router/contest');
const videoRouter=require('./router/videoCreater');
const adminRouter=require('./router/adminRoute');
const cors = require('cors');
const aiRouter = require('./router/aiRouter');


// app initialization
// conataining all the prebuilt intializations of the apis 
const app=express();

// parser
app.use(express.json());
app.use(cookieParser());

// cors
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// authentication
app.use('/auth',authRouter);

// problem
app.use('/problem',ProblemRouter);

// submission
app.use('/submission',submissionRouter);

// comment
app.use('/comment',commentRouter);

// leaderboard
app.use('/leaderboard',leaderboardRouter);

// contest
app.use('/contest',contestRouter);

// video creator
app.use('/video',videoRouter);

// admin routes
app.use('/admin',adminRouter);

// ChatAI
app.use('/ai',aiRouter);


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

