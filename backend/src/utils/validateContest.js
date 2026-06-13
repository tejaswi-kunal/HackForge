const Contest=require('../model/Contest');
const Problem=require('../model/Problems');

const validateContest=async(data)=>{
    let contest=null;
    
    if(data.contestNumber)
    contest=await Contest.findOne({contestNumber:data.contestNumber});

    if(contest)
    {
        throw new Error("Contest Number Should Be Unique!");
    }

    if(data.problems.length<1)
    {
        throw new Error("Atleast 1 Problem Is Required To Create A Contest!");
    }

    if(data.problems.length>4)
    {
        throw new Error("There Could Be Maximum 4 Problems In A Contest!");
    }

    if(new Date(data.startTime)>new Date(data.endTime))
    {
        throw new Error("Choose Valid Start Time And End Time!");
    }

    // now we have to verify the problems
    for(const {problemID} of data.problems)
    {
        const problem=await Problem.findById(problemID);

        if(!problem)
        {
            throw new Error("Select Valid Problems!");
        }
    }

    const ids=data.problems.map(
        item=>item.problemID.toString()
    );

    if(new Set(ids).size!==ids.length)
    {
        throw new Error("Duplicate Problems Are Not Allowed!");
    }
}

module.exports=validateContest;