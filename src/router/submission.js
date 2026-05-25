const express=require('express');
const userMiddleware=require("../middleware/userMiddleware");
const {submitCode,runCode}=require("../controller/submissionAPI");

const submissionRouter=express.Router();

submissionRouter.post("/submitCode/:id",userMiddleware,submitCode);
submissionRouter.post('/runCode/:problemID',userMiddleware,runCode)

module.exports=submissionRouter;