const express=require('express');
const createProblem=require('../controller/createProblem');
const adminMiddleware=require('../middleware/adminMiddleware');


// router
const ProblemRouter=express.Router();
ProblemRouter.post('/create',adminMiddleware,createProblem);
// ProblemRouter.put('/problem/:id/update',updateProblem);
// ProblemRouter.delete('/problem/:id/delete',deleteProblem);
// ProblemRouter.get('/problem/getAllProblem',getAllProblems);
// ProblemRouter.get('/problem/:id/getProblem',getProblem);
// ProblemRouter.get('/problem/getAllProblemSolvedByUser',getAllProblemsSolvedByUser);

module.exports=ProblemRouter;

