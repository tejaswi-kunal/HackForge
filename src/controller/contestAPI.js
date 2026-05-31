const Contest=require('../model/Contest');
const validateContest=require('../utils/validateContest');
const ContestParticipant=require('../model/ContestParticipant');

const createContest=async(req,res)=>{
    try{
        await validateContest(req.body);

        const contest=await Contest.create({
            ...req.body,
            contestCreator:req.result
        });

        res.status(201).json({
            contest:contest,
            message:"New Contest Created Successfully!"
        });
    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const getUpcomingContest=async(req,res)=>{
    try{
        const now=new Date();

        const upcoming=await Contest.find({
            startTime:{ $gt:now }
        }).sort({ startTime:1 }).select("contestNumber title startTime endTime");

        res.status(200).json({
            upcomingContest:upcoming,
            message:"All Upcoming Contests Fetched Successfully!"
        });
    }catch(err){
        res.status(400).send("Error + "+err.message);
    }
}

const getRunningContest=async(req,res)=>{
    try{
        const now = new Date();

        const running=await Contest.find({
            startTime:{ $lte:now },
            endTime:{ $gte:now }
        }).sort({ startTime:1 }).select("contestNumber title startTime endTime");

        res.status(200).json({
            runningContest:running,
            message:"All Running Contests Fetched Successfully!"
        });
    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const getEndedContest=async(req,res)=>{
    try{
        const now = new Date();
        const page=Number(req.query.page) || 1;
        const limit=Number(req.query.limit) || 10;

        const skip=(page-1)*limit;

        const ended=await Contest.find({
            endTime:{ $lt:now }
        }).sort({ endTime:-1 }).skip(skip).limit(limit).select("contestNumber title startTime endTime");

        res.status(200).json({
            endedContest:ended,
            message:"Ended Contests Fetched Successfully!"
        })
    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const getContest=async(req,res)=>{
    try{
        const contest=await Contest.findById(req.params.id).select("-contestCreator")

        if(!contest)
        {
            return res.status(400).send("Please Try With Valid Contest Id");
        }

        return res.status(200).json({
            contest:contest,
            message:"Contest Details Fetched Successfully!"
        });
    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const contestRegistration=async(req,res)=>{
    try{
        const contestID=req.params.id;
        const userID=req.result;

        // first we have to check if the contest exist or not
        const contest=await Contest.findById(contestID);

        if(!contest)
        {
            return res.status(404).send("Please Try With A Valid Contest ID");
        }
        const now = new Date();
        if(contest.startTime<=now)
        {
            return res.status(400).send("Invalid Request,Registration Closed!");
        }

        // check if the user is alread registered
        const contestPartCheck=await ContestParticipant.findOne({user:userID,contest:contestID});

        if(contestPartCheck)
        {
            return res.status(400).send("Already Registred!");
        }

        // now we have to register the user
        const contestPart=await ContestParticipant.create({contest:contestID,user:userID});

        res.status(201).json({
            success:true,
            message:"User Registred Successfully!"
        });

    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const getLeaderBoard=async(req,res)=>{
    try{
        const contestID=req.params.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        // first we have to verify if the contest exist 
        const contest=await Contest.findById(contestID);

        if(!contest)
        {
            return res.status(400).send("Invalid Request,Please Try Agian with valid ContestID");
        }

        const leaderboard = await ContestParticipant.find({
            contest: contestID
        })
        .populate("user","userName profilePicture")
        .sort({
            score:-1,
            lastAcceptedTime:1
        })
        .skip(skip)
        .limit(limit);

        res.status(200).json({
        leaderboard,
        totalProblems: contest.problems.length,
        message:"Leaderboard Fetched Successfully!"
        });

    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const myRank=async(req,res)=>{
    try{
        const contestID=req.params.id;
        const userID=req.result;

        const contest=await Contest.findById(contestID);

        if(!contest)
        {
            return res.status(400).send("Plaese Try With A Valid Contest ID");
        }

        const participant = await ContestParticipant.findOne({
            contest: contestID,
            user: userID
        });

        if(!participant)
        {
            return res.status(404).send("User Is Not Registered For This Contest");
        }

        const betterParticipants =
        await ContestParticipant.countDocuments({
            contest: contestID,
            $or:[
                {
                    score:{ $gt: participant.score }
                },
                {
                    score: participant.score,
                    lastAcceptedTime:{
                        $lt: participant.lastAcceptedTime
                    }
                }
            ]
        });

        const rank = betterParticipants + 1;

        res.status(200).json({
            user:participant,
            rank,
            solvedCount: participant.solvedProblems.length
        });

    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

module.exports={createContest,getRunningContest,getUpcomingContest,getEndedContest,getContest,contestRegistration,getLeaderBoard,myRank};

