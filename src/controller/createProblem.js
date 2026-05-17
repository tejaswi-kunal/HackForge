const {getLanguageId,submitBatch,submitToken}=require('../utils/LanguageUtility');
const validateProblem=require('../utils/validateProblem');
const Problem=require('../model/Problems');

const createProblem=async(req,res)=>{
    try{
    // first we have to validate all the feilds
    validateProblem(req.body);

    const {
        visibleTestCases,
        hiddenTestCases,
        referenceSolution
    }=req.body;
    
    // now we have to check if the refrence solution is correct 
    for(const {language,completeCode} of referenceSolution)
    {
        // first we have to access the languageId
        const language_id=getLanguageId(language);

        // now we have to create the submission array for each language code one by one
        // with diffrent visible testcase
        // source_code
        // language_id
        // stdin
        // expected_output

        const submission=visibleTestCases.map(({input,output})=>{
            return {
                source_code:completeCode,
                language_id:language_id,
                stdin:input,
                expected_output:output
            }
        });

        // now we have to check this submission batch
        const submitResult=await submitBatch(submission);

        // first we have to take out the array of tokens from the array of objects 
        const resultTokens=submitResult.map((value)=>value.token);

        const finalResult=await submitToken(resultTokens);

        // now we have to verify the final result
        for(const element of finalResult)
        {

            if(element.status.id!=3)
            {
                // if code is incorrect we dont want to move forward
                return res.status(400).send(element.status.description);
            }
        }
    }

    // now we can store data in db
    const question=await Problem.create({
        ...req.body,
        // we have to also add the refrence of the admin (admin id was already stored in re.result in middleware)
        problemCreator:req.result
    });

    res.status(201).send("Problem Created Successfully!");


    }catch(err){
        res.status(400).send("Error + "+err);
    }
}

module.exports=createProblem;