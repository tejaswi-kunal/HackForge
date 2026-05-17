const jwt=require('jsonwebtoken');
const redisClient=require('../config/redis');

// authentication of jwt token of the user
const userMiddleware=async(req,res,next)=>{
    try{
        const {token}=req.cookies;

        // check if token is present
        if(!token)
        {
            throw new Error('Token Expired!');
        }

        // check if token is already blocked->if its present in the redis db
        const isBlocked=await redisClient.exists(`token:${token}`);

        if(isBlocked)
        {
            throw new Error('Token Expired!');
        }

        // checking token validation
        const payload=jwt.verify(token,process.env.SECRET_KEY);

        // storing the user id for further use 
        const result=payload.id;
        req.result=result;
        
        next();
    }catch(err){
        res.status(401).send("Error : " + err.message);
    }
}

module.exports=userMiddleware;
