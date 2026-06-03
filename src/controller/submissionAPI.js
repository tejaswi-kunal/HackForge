const {validateLanguage,getLanguageId,submitBatch,submitToken}=require("../utils/ProblemUtility");
const Submission=require("../model/Submission");
const Problem=require("../model/Problems");
const User=require("../model/User");
const ContestParticipant=require('../model/ContestParticipant'); 

const submitCode=async(req,res)=>{
    try{
        const problemID=req.params.id;
        const userID=req.result;

        if(!problemID || !userID)
        {
            return res.status(404).send("Valid ID Didnt Recieved Please Try Again With Valid ID");
        }

        const language=req.body.language;
        validateLanguage(language);

        const code = req.body.code;
        const DSAproblem=await Problem.findById(problemID);

        if(!DSAproblem) 
        {
            return res.status(404).send("Problem Not Found!");
        }

        // first phase update of the submission of the code
        const submittedCode=await Submission.create({
            problem:problemID,
            user:userID,
            submittedCode:{
                language:language,
                completeCode:code
            },
            contest:req.body.contestID || null,
            testCasesTotal:DSAproblem.visibleTestCases.length+DSAproblem.hiddenTestCases.length
        });

        // now we have to check the result of the code using judge0
        const language_id=getLanguageId(language);

        const submission1=DSAproblem.visibleTestCases.map(({input,output})=>{
            return {
                source_code:code,
                language_id:language_id,
                stdin:input,
                expected_output:output
            }
        });
        const submission2=DSAproblem.hiddenTestCases.map(({input,output})=>{
            return {
                source_code:code,
                language_id:language_id,
                stdin:input,
                expected_output:output
            }
        });
        const submission=[...submission1,...submission2];

        const submitResult=await submitBatch(submission);
        const resultTokens=submitResult.map((value)=>value.token);
        const finalResult=await submitToken(resultTokens);

        // now we have to verify the result using the final result
        let testCasesPassed=0;
        let runtime=0;
        let memory=0;
        let status="Accepted"
        let errorMessege='';

        for(const element of finalResult)
        {
            if(element.status.id==3)
            {
                testCasesPassed=testCasesPassed+1;
                runtime=runtime+Number(element.time);
                memory=Math.max(memory,element.memory);
            }

            else if(element.status.id==4)
            {
                if(errorMessege=='')
                {
                    errorMessege = `Expected: ${element.expected_output} | Got: ${element.stdout}`;
                }
                if(status=="Accepted")
                {
                    status="Wrong Answer";
                }
            }

            else if(element.status.id==5)
            {
                if(errorMessege=='')
                {
                    errorMessege=element.stderr;
                }
                if(status=="Accepted")
                {
                    status="Time Limit Exceeded";
                }
            }

            else if(element.status.id==6)
            {
                if(errorMessege=='')
                {
                    errorMessege = element.compile_output || element.stderr;
                }
                if(status=="Accepted")
                {
                    status="Compilation Error";
                }
            }

            else if(element.status.id>=7 && element.status.id<=12)
            {
                if(errorMessege=='')
                {
                    errorMessege=element.stderr;
                }
                if(status=="Accepted")
                {
                    status="Runtime Error";
                }
            }

            else if(element.status.id==13)
            {
                if(errorMessege=='')
                {
                    errorMessege=element.stderr;
                }
                if(status=="Accepted")
                {
                    status="Internal Error";
                }
            }

            else 
            {
                if(errorMessege=='')
                {
                    errorMessege=element.stderr;
                }
                if(status=="Accepted")
                {
                    status="Error";
                }
            }
        }

        // now we have to update the submission of the phase1
        submittedCode.status=status;
        submittedCode.runtime=runtime;
        submittedCode.memory=memory;
        submittedCode.testCasesPassed=testCasesPassed;
        submittedCode.errorMessege=errorMessege;

        await submittedCode.save();

        // we have to also update the totalSubmissions and acceptedSubmissions of this problem
        if(status=="Accepted")
        {
            if(DSAproblem.acceptedSubmissions)
            {
                DSAproblem.acceptedSubmissions+=1;
            }
            else
            {
                DSAproblem.acceptedSubmissions=1;
            }
        }

        if(DSAproblem.totalSubmissions)
            DSAproblem.totalSubmissions+=1;

        else
        DSAproblem.totalSubmissions=1;

        await DSAproblem.save();

        // we have to also updated the problemSolved of user 
        const user=await User.findById(req.result);

        if(!user) 
        {
            return res.status(404).send("User Not Found!");
        }

        if(status=="Accepted")
        {
            user.acceptedSubmissions+=1;
        }

        if(!user.problemsSolved.includes(problemID) && status=='Accepted')
        {
            // if the current submittend problem is correct and its not in the list of solvedProblem 
            user.problemsSolved.push(problemID);
            
            // points update
            if(DSAproblem.difficulty=='easy')
            {
                user.easySolved++;
                user.totalPoints+=2;
            }

            else if(DSAproblem.difficulty=='medium')
            {
                user.mediumSolved++;
                user.totalPoints+=4;
            }

            else
            {
                user.hardSolved++;
                user.totalPoints+=8;
            }

            // streak update
            if(!user.lastSolvedDate)
            {
                user.streakCount=1;
                user.maxStreak=1;
            }

            else
            {
                const lastDay=new Date(user.lastSolvedDate);
                const today=new Date();

                // coverting to midnight-->since we only want day comparision we dont care about hours in each day
                lastDay.setHours(0,0,0,0);
                today.setHours(0,0,0,0);

                const diffTime = today - lastDay;

                // converting to days
                const diffDays = diffTime / (1000 * 60 * 60 * 24);

                if(diffDays==1)
                {
                    user.streakCount++;
                    user.maxStreak=Math.max(user.streakCount,user.maxStreak);
                }

                else if(diffDays>1)
                {
                    user.streakCount=1;
                }
            }
            user.lastSolvedDate=new Date();

            // heat map update
            const currDay = new Date().toISOString().split('T')[0];

            const activity = user.activityCalendar.find(
                item => item.date === currDay
            );

            if(activity)
            {
                activity.count++;
            }

            else
            {
                user.activityCalendar.push({
                    date:currDay,
                    count:1
                });
            }
        }

        user.submissionsCount+=1;
        await user.save();


        if(req.participant && status==='Accepted')
        {
            const alreadySolvedContestProblem=
            req.participant.solvedProblems.some(
                id=>id.toString()===problemID
            );

            if(!alreadySolvedContestProblem)
            {
                req.participant.solvedProblems.push(problemID);

                req.participant.score+=
                req.contestProblem.points;

                req.participant.lastAcceptedTime=
                new Date();

                await req.participant.save();
            }
        }

        res.status(201).send(submittedCode);
    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const runCode=async(req,res)=>{
    try{
        const language=req.body.language;
        validateLanguage(language);

        const code = req.body.code;

        const {problemID}=req.params;
        if(!problemID)
        {
            return res.status(404).send("No Valid Problem Id Recived Please Try Again!");
        }
        const DSAproblem=await Problem.findById(problemID);
        if(!DSAproblem)
        {
            return res.status(400).send("Invalid Problem Id!");
        }

        const language_id=getLanguageId(language);

        const submission=DSAproblem.visibleTestCases.map(({input,output})=>{
            return {
                source_code:code,
                language_id:language_id,
                stdin:input,
                expected_output:output
            }
        });

        const submitResult=await submitBatch(submission);
        const resultTokens=submitResult.map((value)=>value.token);
        const finalResult=await submitToken(resultTokens);

        res.status(200).send(finalResult);
    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

module.exports={submitCode,runCode};