const {validateRegister,validateUpdateProfile}=require('../utils/validateUser');
const bcrypt=require('bcrypt');
const User=require('../model/User');
const jwt=require('jsonwebtoken');
const redisClient = require('../config/redis');
const validator=require('validator');
const Submission=require('../model/Submission');

const getUserSubmissions=async(req,res)=>{
    try{
        const userID=req.result;

        const page=Number(req.query.page)||1;
        const limit=Number(req.query.limit)||10;

        const skip=(page-1)*limit;

        const user=await User.findById(userID);

        if(!user)
        {
            return res.status(404).send("Invalid User ID");
        }

        const submissions=await Submission.find({
            user:userID
        })
        .populate('problem','title difficulty')
        .sort({createdAt:-1})
        .skip(skip)
        .limit(limit);

        const totalSubmissions=await Submission.countDocuments({
            user:userID
        });

        return res.status(200).json({
            submissions,
            totalSubmissions,
            currentPage:page,
            totalPages:Math.ceil(totalSubmissions/limit)
        });

    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}


const userRegister=async (req,res)=>{
    try{
        // api level validation
        validateRegister(req.body);

        // bycrption of password
        req.body.password=await bcrypt.hash(req.body.password,10);

        // saving user in db
        const people=await User.create({
            ...req.body,
            lastLogin:Date.now(),
            role:'user'
        });

        // creating jwt token
        const token=jwt.sign({id:people._id,emailId:people.emailId,role:'user'},process.env.SECRET_KEY,{expiresIn:'60m'});

        // sending jwt token 
        res.cookie('token',token,{maxAge:60*60*1000});

        let currentStreak = people.streakCount;

        if(people.lastSolvedDate)
        {
            const lastDay = new Date(people.lastSolvedDate);
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
            userName:people.userName,
            emailId:people.emailId,
            _id:people._id,
            streak:currentStreak,
            role:people.role
        };
        res.status(201).json({
            user:reply,
            message:"User Registered Successfully!"
        })

    }catch(err){
        res.status(400).send("Error : " + err.message);
    }

}

const login=async (req,res)=>{
    try{
        const data=req.body;

        if(!data.emailId || !data.password)
        {
            throw new Error('All required credentails are not present!');
        }

        const people=await User.findOne({emailId:data.emailId});

        if(!people)
        {
            throw new Error('Wrong Credentials!');
        }

        // matching the password
        const match=await bcrypt.compare(data.password,people.password);

        if(!match)
        {
            throw new Error('Wrong Credentials!');
        }

        // updating the login date
        people.lastLogin=Date.now();
        await people.save();

        // creating jwt token
        const token=jwt.sign({id:people._id,emailId:people.emailId,role:people.role},process.env.SECRET_KEY,{expiresIn:'60m'});

        // sending jwt token
        res.cookie('token',token,{maxAge:60*60*1000}); 

        let currentStreak = people.streakCount;

        if(people.lastSolvedDate)
        {
            const lastDay = new Date(people.lastSolvedDate);
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
            userName:people.userName,
            emailId:people.emailId,
            _id:people._id,
            streak:currentStreak,
            role:people.role
        };

        res.status(200).json({
            user:reply,
            message:"Logged In Successfully!"
        })
    }catch(err){
        res.status(400).send("Error : " + err.message);
    }
}

const logout=async(req,res)=>{
    try{
        const {token}=req.cookies;

        // expire the token
        // add to the blocked list of tokens
    
        const payload=jwt.decode(token);
        await redisClient.set(`token:${token}`,"Blocked");
        await redisClient.expireAt(`token:${token}`,payload.exp);

        // clear the token from cookie
        res.cookie("token",null,{expires:new Date(Date.now())});
        res.status(200).send('Logged Out Successfuly!');
    }catch(err){
        res.status(400).send("Error : " + err.message);
    }
}

const adminRegister=async (req,res)=>{
    try{
        // api level validation
        validateRegister(req.body);

        // bycrption of password
        req.body.password=await bcrypt.hash(req.body.password,10);

        // saving admin in db
        const people=await User.create({
            ...req.body,
            lastLogin:Date.now(),
            role:'admin'
        });

        // creating jwt token
        const token=jwt.sign({id:people._id,emailId:people.emailId,role:'admin'},process.env.SECRET_KEY,{expiresIn:'60m'});

        // sending jwt token 
        res.cookie('token',token,{maxAge:60*60*1000});

                let currentStreak = people.streakCount;

        if(people.lastSolvedDate)
        {
            const lastDay = new Date(people.lastSolvedDate);
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
            userName:people.userName,
            emailId:people.emailId,
            _id:people._id,
            streak:currentStreak,
            role:people.role
        };

        res.status(200).json({
            user:reply,
            message:"Admin Registered Successfully!"
        });

    }catch(err){
        res.status(400).send("Error : " + err.message);
    }

}

const getAccount=async (req,res)=>{
    try{
        // validate the jwt token
        const id=req.result;

        // return the account information of the user
        const user = await User.findById(id).select("-password -passwordChangedAt -__v");

        if(!user)
        {
            throw new Error("Invalid Request Try Again")
        }

        const higherRankedUsers = await User.countDocuments({
            totalPoints:{ $gt:user.totalPoints }
        });

        const rank = higherRankedUsers + 1;

        // streak bug resolved
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

        res.status(200).json({
            user:{
                ...user.toObject(),
                streakCount: currentStreak
            },
            rank: rank
        });

        }catch(err){
            res.status(400).send("Error : " + err.message);
        }

}

// Delete Account
const deleteAccount=async(req,res)=>{
    try{
        const user=await User.findByIdAndDelete(req.result);
        res.status(200).send("Account Deleted Successfully!");
        
    }catch(err){
        res.status(500).send("Error "+err.message);
    }
}
// Update Profile
const updateProfile=async(req,res)=>{
    try{
        const userID=req.result;

        if(!userID)
        {
            return res.status(404).send("No Valid User Id Recieved Please Try Again!");
        }

        const user=await User.findById(userID);

        if(!user)
        {
            return res.status(404).send("Invalid User ID");
        }

        // api level validation before user update
        validateUpdateProfile(req.body);

        const {userName,emailId,password,role,problemsSolved,submissionsCount,acceptedSubmissions,
            easySolved,mediumSolved,hardSolved,totalPoints,savedProblems,rating,lastLogin,passwordChangedAt,
            ...rest}=req.body;

        const updatedProfile=await User.findByIdAndUpdate(userID,{...rest},{runValidators:true, new:true});

        res.status(200).json({
            updatedProfile:updatedProfile,
            message:"User Updated Successfully!"
        });
    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

// Change Password
const changePassword=async(req,res)=>{
    try{
        const userID=req.result;
        const data=req.body;

        // first we have to verify the old passwod
        const people=await User.findById(userID);

        if(!people)
        {
            return res.status(404).send("Wrong Credentials");
        }

        if(!data.oldPassword || !data.newPassword)
        {
            res.status(404).send("All Required Feilds Are Not Present!");
        }

        // matching the password
        const match=await bcrypt.compare(data.oldPassword,people.password);

        if(!match)
        {
            return res.status(400).send('Wrong Credentials!');
        }

        // validate new password
        if(!validator.isStrongPassword(data.newPassword))
        {
            res.status(400).send('Weak Password!');
        }

        if (data.oldPassword === data.newPassword)
        {
            return res.status(400).send("Old And New Password Cannot Be Same!");
        }

        // now we can update the password 
        people.password=await bcrypt.hash(data.newPassword,10);
        people.passwordChangedAt=Date.now();
        await people.save();

        return res.status(200).send("Password Updated Successfully!");

    }catch(err){
        res.status(400).send("Error "+err.message);
    }
}

// Get Public Profile
const getPublicProfile=async(req,res)=>{
    try{
        const userID=req.params.id;

        if(!userID)
        {
            return res.status(404).send("No Valid User Id Recieved Please Try Again!");
        }

        const user=await User.findById(userID).select("-password -passwordChangedAt -emailId -role -savedProblems -lastLogin -updatedAt -__v");

        if(!user)
        {
            return res.status(404).send("Invalid User ID");
        }

        const higherRankedUsers = await User.countDocuments({
            totalPoints:{ $gt:user.totalPoints }
        });

        const rank = higherRankedUsers + 1;

        // streak bug resolved
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

        res.status(200).json({
            user:{
                ...user.toObject(),
                streakCount: currentStreak
            },
            rank: rank
        });
        
    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

module.exports={userRegister,login,logout,adminRegister,getAccount,deleteAccount,updateProfile,changePassword,getPublicProfile,getUserSubmissions};