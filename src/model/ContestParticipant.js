const mongoose=require('mongoose');
const {Schema}=mongoose;

const contestParticipantSchema=new Schema({
    contest:{
        type:Schema.Types.ObjectId,
        ref:'Contest'
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    score:{
        type:Number,
        default:0
    },
    solvedProblems:[{
        type:Schema.Types.ObjectId,
        ref:'Problem'
    }],
    lastAcceptedTime:{
        type:Date
    },
    registeredAt:{
        type:Date,
        default:Date.now
    }
});

// there should be a unique relationship bwt a participat and a contest
contestParticipantSchema.index(
    { contest:1, user:1 },
    { unique:true }
);

const ContestParticipant=mongoose.model('ContestParticipant',contestParticipantSchema);
module.exports=ContestParticipant;