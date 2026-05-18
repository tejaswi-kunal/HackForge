const mongoose=require('mongoose');

const {Schema}=mongoose;

const submissionSchema=new Schema({
    problem:{
        type:Schema.Types.ObjectId,
        ref:'Problem',
        required:true
    },

    user:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },

    submittedCode:{
        language:{
            type:String,
            enum:["cpp","java","python","javascript"],
            required:true
        },
        completeCode:{
            type:String,
            required:true
        }
    },

    status: {
        type: String,
        enum: [
            "pending",
            "running",
            "accepted",
            "wrong_answer",
            "time_limit_exceeded",
            "memory_limit_exceeded",
            "runtime_error",
            "compilation_error",
            "internal_error"
        ],
        default: "pending"
    },

    runtime:{
        type:Number,
        default:0
    },

    memory:{
        type:Number,
        default:0
    },

    testCasesPassed:{
        type:Number,
        default:0
    },

    testCasesTotal:{
        type:Number,
        default:0
    }
},{
    timestamps:true
});

const Submission=mongoose.model('Submission',submissionSchema);

module.exports=Submission;
