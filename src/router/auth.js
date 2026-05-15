const express=require('express');
const {userRegister,login,logout,adminRegister,getAccount}=require('../controller/userAuthent');
const userMiddleware=require('../middleware/userMiddleware');
const adminMiddleware=require('../middleware/adminMiddleware');

const authRouter=express.Router();

authRouter.post('/register',userRegister);
authRouter.post('/login',login);
authRouter.post('/logout',userMiddleware,logout);
authRouter.post('/admin/register',adminMiddleware,adminRegister);
authRouter.get('/get/account',userMiddleware,getAccount);

module.exports=authRouter;


