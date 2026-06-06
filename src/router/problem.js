const express=require('express');
const {createProblem,updateProblem,deleteProblem,getProblem,
    getAllProblems,filterProblems,getAllProblemsSolvedByUser,
    saveProblem,getSavedProblems,
    getSubmissions,likeProblem,dislikeProblem,userProblemReaction,
    getProblemStats,checkSaved}
            = require('../controller/problemAPI');
   
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
ProblemRouter.get('/getAllProblemSolvedByUser',userMiddleware,getAllProblemsSolvedByUser);
ProblemRouter.post('/saveProblem/:id',userMiddleware,saveProblem);
ProblemRouter.get('/getSavedProblems',userMiddleware,getSavedProblems);
ProblemRouter.get('/getSubmissions/:id',userMiddleware,getSubmissions);
ProblemRouter.post('/like/:id',userMiddleware,likeProblem);
ProblemRouter.post('/dislike/:id',userMiddleware,dislikeProblem);
ProblemRouter.get('/reaction/:id',userMiddleware,userProblemReaction);
ProblemRouter.get('/getProblemStats',userMiddleware,getProblemStats);
ProblemRouter.get('/checkSaved/:id',userMiddleware,checkSaved);

module.exports=ProblemRouter;

