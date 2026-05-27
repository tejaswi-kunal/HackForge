const express=require('express');
const userMiddleware = require('../middleware/userMiddleware');
const getLeaderboard=require('../controller/leaderboardAPI');


const leaderboardRouter=express.Router();

leaderboardRouter.get('/getLeaderboard',userMiddleware,getLeaderboard);

module.exports=leaderboardRouter;