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

const getUpcomingContest = async(req,res) => {
    try{
        const now = new Date();
        const userID = req.result;

        const upcoming = await Contest.find({
            startTime: { $gt: now }
        })
        .sort({ startTime: 1 })
        .select("contestNumber title startTime endTime");

        const contestIDs = upcoming.map(contest => contest._id);

        const registrations = await ContestParticipant.find({
            user: userID,
            contest: { $in: contestIDs }
        }).select("contest");

        const registeredContestSet = new Set(
            registrations.map(item => item.contest.toString())
        );

        const upcomingContest = upcoming.map(contest => ({
            ...contest.toObject(),
            isRegistered: registeredContestSet.has(contest._id.toString())
        }));

        res.status(200).json({
            upcomingContest,
            message: "All Upcoming Contests Fetched Successfully!"
        });

    } catch(err){
        res.status(400).send("Error : " + err.message);
    }
}

const getRunningContest = async(req,res) => {
    try{
        const now = new Date();
        const userID = req.result;

        const running = await Contest.find({
            startTime: { $lte: now },
            endTime: { $gte: now }
        })
        .sort({ startTime: 1 })
        .select("contestNumber title startTime endTime");

        const contestIDs = running.map(contest => contest._id);

        const registrations = await ContestParticipant.find({
            user: userID,
            contest: { $in: contestIDs }
        }).select("contest");

        const registeredContestSet = new Set(
            registrations.map(item => item.contest.toString())
        );

        const runningContest = running.map(contest => ({
            ...contest.toObject(),
            isRegistered: registeredContestSet.has(contest._id.toString())
        }));

        res.status(200).json({
            runningContest,
            message: "All Running Contests Fetched Successfully!"
        });

    }catch(err){
        res.status(400).send("Error : " + err.message);
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

const getContest = async(req,res) => {
    try {
        const contest = await Contest.findById(req.params.id).select("-contestCreator");

        if(!contest) {
            return res.status(400).send("Please Try With Valid Contest Id");
        }

        const now = new Date();
        let contestResponse = contest.toObject();

        // FIX: Strip the problems array if the contest hasn't started yet
        if (now < contest.startTime) {
            delete contestResponse.problems;
        }

        return res.status(200).json({
            contest: contestResponse,
            message: "Contest Details Fetched Successfully!"
        });
    } catch(err) {
        res.status(400).send("Error : " + err.message);
    }
}

const contestRegistration = async(req,res) => {
    try {
        const contestID = req.params.id;
        const userID = req.result;

        const contest = await Contest.findById(contestID);

        if(!contest) {
            return res.status(404).send("Please Try With A Valid Contest ID");
        }
        
        const now = new Date();
        
        // FIX: Allow registration until the contest officially ends
        if(now >= contest.endTime) {
            return res.status(400).send("Invalid Request, Contest Has Already Ended!");
        }

        const contestPartCheck = await ContestParticipant.findOne({user:userID, contest:contestID});

        if(contestPartCheck) {
            return res.status(400).send("Already Registred!");
        }

        const contestPart = await ContestParticipant.create({contest:contestID, user:userID});

        res.status(201).json({
            success: true,
            message: "User Registred Successfully!"
        });

    } catch(err) {
        res.status(400).send("Error : " + err.message);
    }
}

const getLeaderBoard = async(req,res) => {
    try {
        const contestID = req.params.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const contest = await Contest.findById(contestID);

        if(!contest) {
            return res.status(400).send("Invalid Request, Please Try Agian with valid ContestID");
        }

        const leaderboard = await ContestParticipant.find({
            contest: contestID
        })
        .populate("user","userName profilePicture")
        .sort({
            score: -1,
            lastAcceptedTime: 1,
            _id: 1 // FIX: Absolute tie-breaker to prevent pagination glitches
        })
        .skip(skip)
        .limit(limit);

        res.status(200).json({
            leaderboard,
            totalProblems: contest.problems.length,
            message: "Leaderboard Fetched Successfully!"
        });

    } catch(err) {
        res.status(400).send("Error : " + err.message);
    }
}

const myRank = async(req,res) => {
    try {
        const contestID = req.params.id;
        const userID = req.result;

        const contest = await Contest.findById(contestID);

        if(!contest) {
            return res.status(400).send("Plaese Try With A Valid Contest ID");
        }

        const participant = await ContestParticipant.findOne({
            contest: contestID,
            user: userID
        });

        if(!participant) {
            return res.status(404).send("User Is Not Registered For This Contest");
        }

        // FIX: Safely handle users who haven't solved anything yet
        let betterParticipantsQuery;

        if (participant.score === 0 || !participant.lastAcceptedTime) {
            // Only participants with > 0 points are ahead of them
            betterParticipantsQuery = {
                contest: contestID,
                score: { $gt: 0 }
            };
        } else {
            // Standard tie-breaker for active solvers
            betterParticipantsQuery = {
                contest: contestID,
                $or: [
                    { score: { $gt: participant.score } },
                    { score: participant.score, lastAcceptedTime: { $lt: participant.lastAcceptedTime } }
                ]
            };
        }

        const betterParticipants = await ContestParticipant.countDocuments(betterParticipantsQuery);
        const rank = betterParticipants + 1;

        res.status(200).json({
            user: participant,
            rank,
            solvedCount: participant.solvedProblems.length
        });

    } catch(err) {
        res.status(400).send("Error : " + err.message);
    }
}

const enterContest=async(req,res)=>{
    try{
        const contestID=req.params.id;
        const userID=req.result;

        // first we have to verify if the contest exist
        const contest=await Contest.findById(contestID).select("-contestCreator");

        if(!contest)
        {
            return res.status(404).send("Invalid Request!,Please Try With Valid Contest ID");
        }

        // verify if the user participated in the contest 
        const contestPartCheck=await ContestParticipant.findOne({user:userID,contest:contestID});

        if(!contestPartCheck)
        {
            return res.status(400).send("User Is Not Part Of This Running Contest!");
        }

        // verify if the contest is running 
        const now = new Date();
        if(!(now>=contest.startTime && now<=contest.endTime))
        {
            return res.status(400).send("Contest Is Not Running!");
        }

        res.status(200).json({
            success:true,
            contest
        })
    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const updateContest=async(req,res)=>{
    try{
        // valid contest check
        const contestID=req.params.id;

        if(!contestID)
        {
            return res.status(404).send("No Valid Contest ID Recieved!");
        }

        const contest=await Contest.findById(contestID);

        if(!contest)
        {
            return res.status(404).send("Invalid Contest ID");
        }

        // check if its a upcoming contest
        const now = new Date();

        if(now>=contest.startTime)
        {
            return res.status(400).send("Invalid Request!,This Request Is Only Valid For Upcoming Contests");
        }

        // validate the new body
        const {contestNumber,contestCreator,...rest}=req.body;
        await validateContest(rest);

        const updatedContest=await Contest.findByIdAndUpdate(contestID,{...rest},{runValidators:true, new:true});

        res.status(200).json({
            success:true,
            updatedContest:updatedContest,
            message:"Contest Updated Sucessfully!"
        });

    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const deleteContest=async(req,res)=>{
    try{
         // valid contest check
        const contestID=req.params.id;

        if(!contestID)
        {
            return res.status(404).send("No Valid Contest ID Recieved!");
        }

        const contest=await Contest.findById(contestID);

        if(!contest)
        {
            return res.status(404).send("Invalid Contest ID");
        }

        // check if its a upcoming contest
        const now = new Date();

        if(now>=contest.startTime)
        {
            return res.status(400).send("Invalid Request!,This Request Is Only Valid For Upcoming Contests");
        }

        // now we can delete this contest
        const deletedContest=await Contest.findByIdAndDelete(contestID);
        res.status(200).send("Contest Deleted Successfully!");
    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const checkRegistration=async(req,res)=>{
    try{
        
    }catch(err){

    }
}



module.exports={createContest,getRunningContest,getUpcomingContest,getEndedContest,getContest,
    contestRegistration,getLeaderBoard,myRank,enterContest,updateContest,deleteContest};

