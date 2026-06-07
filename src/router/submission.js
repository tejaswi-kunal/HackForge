const express=require('express');
const userMiddleware=require("../middleware/userMiddleware");
const {submitCode,runCode}=require("../controller/submissionAPI");
const contestSubmitMiddleware=require('../middleware/contestSubmitMiddleware');
const {submitRateLimiter}=require('../utils/rateLimiter');

const submissionRouter=express.Router();

submissionRouter.post("/submitCode/:id",userMiddleware,submitRateLimiter,contestSubmitMiddleware,submitCode);
submissionRouter.post('/runCode/:problemID',userMiddleware,runCode)

module.exports=submissionRouter;