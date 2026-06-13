const User = require('../model/User'); 
const Problem = require('../model/Problems');
const Submission = require('../model/Submission');
const Contest = require('../model/Contest');

const getDashboardOverview = async (req, res) => {
    try {
        // Run all 4 queries concurrently for maximum performance
        const [
            totalUsers,
            totalProblems,
            totalSubmissions,
            recentSubmissionsData
        ] = await Promise.all([
            // 1. Count only regular users (exclude admins)
            User.countDocuments({ role: { $ne: 'admin' } }), 
            
            // 2. Count all problems
            Problem.countDocuments({}),
            
            // 3. Count all submissions
            Submission.countDocuments({}),
            
            // 4. Fetch the 5 most recent submissions
            Submission.find({})
                .sort({ createdAt: -1 }) // Sort descending by timestamp
                .limit(8)
                // Populate based on the exact refs in your submissionSchema
                .populate('user', 'userName') 
                .populate('problem', 'title') 
        ]);

        // Map the MongoDB documents into the exact format your React UI expects
        const recentSubmissions = recentSubmissionsData.map(sub => ({
            id: sub._id,
            // Safe navigation (?.) just in case a problem/user was deleted
            problem: sub.problem?.title || "Unknown Problem", 
            user: sub.user?.userName || "Deleted User",
            status: sub.status, 
            time: sub.createdAt // The frontend can format this date string
        }));

        // Send the response matching the AdminDashboardOverview.jsx state structure
        res.status(200).json({
            stats: {
                activeUsers: totalUsers,
                totalProblems: totalProblems,
                totalSubmissions: totalSubmissions
            },
            recentSubmissions,
            message: "Dashboard stats fetched successfully!"
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ 
            error: "An error occurred while fetching dashboard statistics." 
        });
    }
};

const getAllSubmissions = async (req, res) => {
    try {
        // 1. Extract and format pagination parameters from the URL query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 2. Fetch paginated data and total count simultaneously
        const [submissionsData, totalSubmissions] = await Promise.all([
            Submission.find({})
                .sort({ createdAt: -1 }) // Newest first
                .skip(skip)
                .limit(limit)
                .populate('user', 'userName profilePicture') 
                .populate('problem', 'title'),
            
            Submission.countDocuments({})
        ]);

        // 3. Map the data into a clean structure for the frontend table
        const submissions = submissionsData.map(sub => ({
            id: sub._id,
            problem: sub.problem?.title || "Unknown Problem",
            user: sub.user?.userName || "Deleted User",
            userAvatar: sub.user?.profilePicture || null,
            status: sub.status,
            language: sub.submittedCode?.language || "N/A",
            runtime: sub.runtime,
            memory: sub.memory,
            time: sub.createdAt
        }));

        // 4. Calculate total pages
        const totalPages = Math.ceil(totalSubmissions / limit);

        // 5. Send payload with dedicated pagination metadata
        res.status(200).json({
            submissions,
            pagination: {
                currentPage: page,
                totalPages: totalPages === 0 ? 1 : totalPages, // Prevent "Page 1 of 0"
                totalSubmissions,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            message: "Paginated submissions fetched successfully!"
        });

    } catch (error) {
        console.error("Fetch All Submissions Error:", error);
        res.status(500).json({ 
            error: "An error occurred while fetching the submissions." 
        });
    }
};

const getProblem=async(req,res)=>{
    try{
        const problemID=req.params.id;

        if(!problemID)
        {
            res.status(404).send("Please Request With A Valid Problem ID");
        }

        const DSAproblem=await Problem.findById(problemID);

        if(!DSAproblem)
        {
            res.status(404).send("Problem Not Found!");
        }

        res.status(200).send(DSAproblem);
    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const getUpcomingContestDetails=async(req,res)=>{
    try{
        const contestID=req.params.id;
        if(!contestID)
        {
            res.status(404).send("Please Try With A Valid Contest ID");
        }

        const contest = await Contest.findById(contestID);
        if(!contest)
        {
            res.status(404).send("Contest Not Found!");
        }

        res.status(200).send(contest);

    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

module.exports = {
    getDashboardOverview,
    getAllSubmissions,
    getProblem,
    getUpcomingContestDetails
};
