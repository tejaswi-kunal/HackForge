const express=require('express');
const createProblem=require('../controller/problemAPI');
const adminMiddleware=require('../middleware/adminMiddleware');


// router
const ProblemRouter=express.Router();
ProblemRouter.post('/create',adminMiddleware,createProblem);
// ProblemRouter.put('/update/:id',updateProblem);
// ProblemRouter.delete('/delete/:id',deleteProblem);
// ProblemRouter.get('/getProblem/:id',getProblem);
// ProblemRouter.get('/getAllProblem',getAllProblems);
// ProblemRouter.get('/getAllProblemSolvedByUser',getAllProblemsSolvedByUser);

module.exports=ProblemRouter;

