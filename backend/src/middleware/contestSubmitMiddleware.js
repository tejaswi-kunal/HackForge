const Contest=require('../model/Contest');
const ContestParticipant=require('../model/ContestParticipant');
const Problem=require('../model/Problems');

const contestSubmitMiddleware=async(req,res,next)=>{
    try{
        const problemID=req.params.id;
        const userID=req.result;
        const contestID=req.body.contestID;

        //contest id will only exist if this problem is part of contest ow->null
        if(!contestID)
        {
            req.participant=null;
            return next();   
        }

        const contest=await Contest.findById(contestID);
        if(!contest)
        {
            return res.status(404).send(
                "Contest Not Found"
            );
        }

        // verify if the contest is running 
        const now = new Date();
        if(!(now>=contest.startTime && now<=contest.endTime))
        {
            return res.status(400).send("Invalid Request! Contest Is Not Running");
        }

        // verify if the user is registered
        const participant=await ContestParticipant.findOne({user:userID,contest:contestID});

        if(!participant)
        {
            return res.status(403).send("Invalid Request! User Is Not Part Of The Contest");
        }

        // verify if the problem belongs to this contest
        const contestProblem = contest.problems.find(
            item => item.problemID.toString() === problemID
        );

        if(!contestProblem)
        {
            return res.status(400).send(
                "Problem Does Not Belong To This Contest"
            );
        }

        // all checks passed
        req.participant=participant;
        req.contest=contest;
        req.contestProblem=contestProblem;

        next();
    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

module.exports=contestSubmitMiddleware;