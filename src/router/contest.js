const express=require('express');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {createContest,getRunningContest,getUpcomingContest,getEndedContest
        ,getContest,contestRegistration,getLeaderBoard,myRank,enterContest,
        updateContest,deleteContest}
        =require('../controller/contestAPI');
const contestRouter=express.Router();

contestRouter.post('/createContest',adminMiddleware,createContest);
contestRouter.put('/updateContest/:id',adminMiddleware,updateContest);
contestRouter.delete('/deleteContest/:id',adminMiddleware,deleteContest);
contestRouter.get('/getRunningContest',userMiddleware,getRunningContest);
contestRouter.get('/getUpcomingContest',userMiddleware,getUpcomingContest);
contestRouter.get('/getEndedContest',userMiddleware,getEndedContest);
contestRouter.get('/getContest/:id',userMiddleware,getContest);
contestRouter.post('/contestRegistration/:id',userMiddleware,contestRegistration);
contestRouter.get('/getLeaderBoard/:id',userMiddleware,getLeaderBoard);
contestRouter.get('/myRank/:id',userMiddleware,myRank);
contestRouter.get('/enterContest/:id',userMiddleware,enterContest);

module.exports=contestRouter;