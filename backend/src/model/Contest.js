const mongoose=require('mongoose');
const {Schema}=mongoose;

const contestSchema=new Schema({
    contestNumber:{
        type:Number,
        required:true
    },

    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        minlength:3,
        maxlength:50
    },
    startTime:{
        type:Date,
        required:true
    },
    endTime:{
        type:Date,
        required:true
    },
    problems:[
        {
            problemID:{
                type:Schema.Types.ObjectId,
                ref:'Problem',
                required:true
            },
            points:{
                type:Number,
                required:true
            }
        }
    ],
    contestCreator:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }

});

const Contest=mongoose.model('Contest',contestSchema);
module.exports=Contest;