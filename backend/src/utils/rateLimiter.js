const redisClient=require("../config/redis");

const submitRateLimiter=async(req,res,next)=>{
    try{
        const userID=req.result;

        const cooldownKey=`submit_cooldown:${userID}`;
        const limitKey=`submit_limit:${userID}`;

        const cooldownTTL=await redisClient.ttl(cooldownKey);

        if(cooldownTTL>0)
        {
            return res.status(429).json({
                success:false,
                message:`Please Wait ${cooldownTTL} Seconds Before Submitting Again`
            });
        }

        const currentCount=await redisClient.incr(limitKey);

        if(currentCount===1)
        {
            await redisClient.expire(limitKey,3600);
        }

        if(currentCount>25)
        {
            const remainingTime=await redisClient.ttl(limitKey);

            return res.status(429).json({
                success:false,
                message:"Hourly Submission Limit Reached",
                retryAfter:remainingTime
            });
        }

        await redisClient.set(cooldownKey,"1",{
            EX:5
        });

        next();

    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Rate Limiter Error"
        });
    }
}

const authRateLimiter = async (req,res,next)=>{
    try{
        const ip = req.ip;

        const cooldownKey = `auth_cooldown:${ip}`;
        const limitKey = `auth_limit:${ip}`;

        const cooldownTTL = await redisClient.ttl(cooldownKey);

        if(cooldownTTL > 0)
        {
            return res.status(429).json({
                success:false,
                message:`Please Wait ${cooldownTTL} Seconds Before Trying Again`
            });
        }

        const currentCount = await redisClient.incr(limitKey);

        if(currentCount === 1)
        {
            await redisClient.expire(limitKey,1800);
        }

        if(currentCount > 60)
        {
            const remainingTime = await redisClient.ttl(limitKey);

            return res.status(429).json({
                success:false,
                message:"Too Many Authentication Requests",
                retryAfter:remainingTime
            });
        }

        await redisClient.set(cooldownKey,"1",{
            EX:3
        });

        next();

    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Rate Limiter Error"
        });
    }
}
const aiChatRateLimiter = async (req, res, next) => {
    try {
        const userID = req.result;

        const cooldownKey = `ai_chat_cooldown:${userID}`;
        const limitKey = `ai_chat_limit:${userID}`;

        // Cooldown Check
        const cooldownTTL = await redisClient.ttl(cooldownKey);

        if (cooldownTTL > 0) {
            return res.status(429).json({
                success: false,
                message: `Please Wait ${cooldownTTL} Seconds Before Sending Another Message.`
            });
        }

        // Daily Limit Check
        const currentCount = await redisClient.incr(limitKey);

        if (currentCount === 1) {
            // 24 hours
            await redisClient.expire(limitKey, 86400);
        }

        if (currentCount > 10) {
            const remainingTime = await redisClient.ttl(limitKey);

            return res.status(429).json({
                success: false,
                message: "Daily AI Chat Limit Reached.",
                retryAfter: remainingTime
            });
        }

        // Set Cooldown
        await redisClient.set(cooldownKey, "1", {
            EX: 2
        });

        // Optional: expose remaining quota
        req.remainingAIRequests = 10 - currentCount;

        next();

    } catch (err) {
        console.error("AI Chat Rate Limiter Error:", err);

        return res.status(500).json({
            success: false,
            message: "Rate limiter error."
        });
    }
};

module.exports={submitRateLimiter,authRateLimiter,aiChatRateLimiter};