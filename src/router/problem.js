const express=require('express');
const {createProblem,updateProblem,deleteProblem,getProblem,getAllProblems,filterProblems}=require('../controller/problemAPI');
const adminMiddleware=require('../middleware/adminMiddleware');
const userMiddleware=require('../middleware/userMiddleware');


// router
const ProblemRouter=express.Router();
ProblemRouter.post('/create',adminMiddleware,createProblem);
ProblemRouter.put('/update/:id',adminMiddleware,updateProblem);
ProblemRouter.delete('/delete/:id',adminMiddleware,deleteProblem);
ProblemRouter.get('/getProblem/:id',userMiddleware,getProblem);
ProblemRouter.get('/getAllProblem',userMiddleware,getAllProblems);
ProblemRouter.get('/filter',userMiddleware,filterProblems);

// for this we have to build submission Schema
// ProblemRouter.get('/getAllProblemSolvedByUser',getAllProblemsSolvedByUser);

module.exports=ProblemRouter;

