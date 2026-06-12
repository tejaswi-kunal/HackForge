const express=require('express');
const adminMiddleware = require('../middleware/adminMiddleware');
const {getDashboardOverview,getAllSubmissions,getProblem,getUpcomingContestDetails}=require('../controller/adminController');

const adminRouter=express.Router();


adminRouter.get('/dashboard-stats',adminMiddleware,getDashboardOverview);
adminRouter.get('/submissions',adminMiddleware,getAllSubmissions);
adminRouter.get('/getProblem/:id',adminMiddleware,getProblem);
adminRouter.get('/getUpcomingContestDetails/:id',adminMiddleware,getUpcomingContestDetails);
module.exports=adminRouter;