const validateProblem=require('../utils/validateProblem');
const Problem=require('../model/Problems');

const createProblem=async(req,res)=>{
    try{
    // first we have to validate all the feilds and refrence solution
    await validateProblem(req.body);

    // now we can store data in db
    const question=await Problem.create({
        ...req.body,
        // we have to also add the refrence of the admin (admin id was already stored in req.result in middleware)
        problemCreator:req.result
    });

    res.status(201).send("Problem Created Successfully!");


    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const updateProblem=async(req,res)=>{
    try{
        const {id}=req.params;

        //check if we actually recived id
        if(!id)
        {
            return res.status(404).send("No Valid Problem ID Recived Please Try Again!");
        }

        // fetch problem with id recieved
        const DSAproblem=await Problem.findById(id);

        if(!DSAproblem)
        {
            return res.status(400).send("Invalid Problem ID");
        }

        // we will use the put method to update the problem
        // first verify the feilds
        await validateProblem(req.body);

        // now update the problem
        const updatedProblem=await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true,new:true});

        res.status(200).send(updatedProblem);
    }catch(err)
    {
        res.status(400).send("Error : "+err.message);
    }
}

const deleteProblem=async(req,res)=>{
    try{
    // first we have to check if the valid id recived
    const {id}=req.params;

    if(!id)
    {
        return res.status(404).send("No Valid Problem ID Recived Please Try Again!");
    }

    const deletedProblem=await Problem.findByIdAndDelete(id);

    if(!deletedProblem)
    {
        return res.status(400).send("Invalid ID");
    }

    res.status(200).send(deletedProblem);
    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const getProblem=async(req,res)=>{
    try{
        // first verify if we recived a id
        const {id}=req.params;

        if(!id)
        {
            return res.status(404).send("No Valid Problem ID Recived Please Try Again!");
        }

        const DSAproblem=await Problem.findById(id);

        if(!DSAproblem)
        {
            return res.status(400).send("Invalid ID");
        }

        res.status(200).send(DSAproblem);

    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const getAllProblems=async(req,res)=>{
    try{
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    // objects to skip
    const skip = (page-1) * limit;

    const problemSet=await Problem.find({}).skip(skip).limit(limit);
    return res.status(200).send(problemSet);

    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}


module.exports={createProblem,updateProblem,deleteProblem,getProblem,getAllProblems};