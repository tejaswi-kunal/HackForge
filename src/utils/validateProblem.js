const {getLanguageId,submitBatch,submitToken}=require("./ProblemUtility");
const validateProblem=async(data)=>{
    if(!data || typeof data!='object')
    {
        throw new Error("Proper Data Didnt Recived!");
    }

    // now we have to check if all the mandotary feilds are present 
    const mandotaryFeilds=['title','description','difficulty','tags',
                            'visibleTestCases','starterCode','referenceSolution'];
    

    const isValid=mandotaryFeilds.every((Element)=>Object.keys(data).includes(Element));

    if(!isValid)
    {
        throw new Error("All Mandotary Feilds To Create The Problem Is Not Present!");
    }

    // now we have to check data in other feilds are actually present 
    if(data.title.trim()=="")
    {
        throw new Error("Title Required!");
    }

    if(data.description.trim()=="")
    {
        throw new Error("Description Required!");
    }

    // checking the starter code
    const validLanguages=['cpp','java','javascript','python'];

    data.starterCode.forEach((Element)=>{

    if(!validLanguages.includes(Element.language))
    {
        throw new Error("Invalid Language In Starter Code!");
    }

    if(typeof Element.initialCode!=='string' || Element.initialCode.trim()==="")
    {
        throw new Error("Starter Code Is Required!");
    }

    });

    // we have to also check if the refrence solution of the given problem is valid
    const {
        visibleTestCases,
        hiddenTestCases,
        referenceSolution
    }=data;
    
    // now we have to check if the refrence solution is correct 
    for(const {language,completeCode} of referenceSolution)
    {
        // first we have to access the languageId
        const language_id=getLanguageId(language);

        // now we have to create the submission array for each language code one by one
        // with diffrent visible testcase
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

        // final result using the tokens
        const finalResult=await submitToken(resultTokens);

        // now we have to verify the final result
        for(const element of finalResult)
        {
            if(element.status.id!=3)
            {
                throw new Error(`Reference solution failed for language [${language}]: ${element.status.description}`);
            }
        }
    }

    return true;
    
}

module.exports=validateProblem;