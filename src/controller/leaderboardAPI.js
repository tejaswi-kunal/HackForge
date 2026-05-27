const User = require("../model/User");

const getLeaderboard=async(req,res)=>{
    try{
        const page=Number(req.params.page)||1;
        const limit=Number(req.params.limit)||10

        const skip=(page-1)*limit;

        const users=await User.find({})
        .select("userName profilePicture totalPoints")
        .sort({totalPoints:-1})
        .skip(skip)
        .limit(limit);

        res.status(200).json({
            users:users,
            message:"Users Fetched Successfully"
        })
    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}


module.exports=getLeaderboard;