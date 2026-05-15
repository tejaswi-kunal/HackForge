const {getLanguageId,submitBatch}=require('../utils/LanguageUtility');
const validateProblem=require('../utils/validateProblem');
const createProblem=async(req,res)=>{
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

        // tokens recieved,we will get actual result with get req using these tokens
    }

}