const Contest=require('../model/Contest');
const validateContest=require('../utils/validateContest');
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
        const contest=await Contest.findById(req.params).select("-contestCreator")

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
module.exports={createContest,getRunningContest,getUpcomingContest,getEndedContest,getContest};

