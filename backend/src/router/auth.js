const express=require('express');
const {userRegister,login,logout,adminRegister,getAccount,deleteAccount,
    updateProfile,changePassword,getPublicProfile,getUserSubmissions,forgetPassword,validateToken,resetPassword
    }=require('../controller/userAPI');
const userMiddleware=require('../middleware/userMiddleware');
const adminMiddleware=require('../middleware/adminMiddleware');
const User=require('../model/User'); 
const {authRateLimiter}=require('../utils/rateLimiter');

const authRouter=express.Router();

authRouter.post('/register',authRateLimiter,userRegister);
authRouter.post('/login',authRateLimiter,login);
authRouter.post('/logout',userMiddleware,logout);
authRouter.post('/admin/register',adminMiddleware,adminRegister);
authRouter.get('/getAccount',userMiddleware,getAccount);
authRouter.delete('/deleteAccount',userMiddleware,deleteAccount);
authRouter.put('/updateProfile',userMiddleware,updateProfile);
authRouter.put('/changePassword',userMiddleware,changePassword);
authRouter.get('/getPublicProfile/:id',userMiddleware,getPublicProfile);
authRouter.get('/getUserSubmissions',userMiddleware,getUserSubmissions);
authRouter.post('/forgot-password',authRateLimiter,forgetPassword);
authRouter.get("/reset-password/:token",validateToken);
authRouter.post("/reset-password/:token",resetPassword);
authRouter.get('/checkAuth',userMiddleware,async(req,res)=>{
    // we will access this api as the user visit the website using new tab,to check if he is a already Signedup user
    const user=await User.findById(req.result);

    let currentStreak = user.streakCount;

    if(user.lastSolvedDate)
    {
        const lastDay = new Date(user.lastSolvedDate);
        const today = new Date();
        
        lastDay.setUTCHours(0,0,0,0);
        today.setUTCHours(0,0,0,0);

        const diffDays =
            (today - lastDay) / (1000 * 60 * 60 * 24);

        if(diffDays > 1)
        {
            currentStreak = 0;
        }
    }
    const reply={
        userName:user.userName,
        emailId:user.emailId,
        _id:req.result,
        streak:currentStreak,
        role:user.role
    };

    res.status(200).json({
        user:reply,
        message:"Valid User"
    });
})

module.exports=authRouter;


