const express=require('express');
const userMiddleware=require("../middleware/userMiddleware");
const submitCode=require("../controller/submissionAPI");

const submissionRouter=express.Router();

submissionRouter.post("/submitCode/:id",userMiddleware,submitCode);

module.exports=submissionRouter;