const {validateLanguage,getLanguageId,submitBatch,submitToken}=require("../utils/ProblemUtility");
const Submission=require("../model/Submission");
const Problem=require("../model/Problems");

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

        // first phase update of the submission of the code
        const submittedCode=await Submission.create({
            problem:problemID,
            user:userID,
            submittedCode:{
                language:language,
                completeCode:code
            },
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
                    errorMessege=element.stderr;
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
                    errorMessege=element.stderr;
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

        res.status(201).send(submittedCode);
    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

module.exports=submitCode;

//     language_id: 54,
//     stdin: '2 3',
//     expected_output: '5',
//     stdout: '5',
//     status_id: 3,
//     created_at: '2025-05-12T16:47:37.239Z',
//     finished_at: '2025-05-12T16:47:37.695Z',
//     time: '0.002',
//     memory: 904,
//     stderr: null,
//     token: '611405fa-4f31-44a6-99c8-6f407bc14e73',