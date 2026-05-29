const express=require('express');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const createContest=require('../controller/contestAPI');
const contestRouter=express.Router();

contestRouter.post('/createContest',adminMiddleware,createContest);