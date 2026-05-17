
const validateProblem=(data)=>{
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
    
}

module.exports=validateProblem;