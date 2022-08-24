
const mongoose=require("mongoose");
const User=require("./User");
const taskSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:User,
        required:true,
        index:true
    },
    taskName:{
        type:String,
        required:true
    },
    completed:{
        type:Boolean,
        default:false,
        required:true
    },
    created_at:{
        type:Date,
        default:Date.now(),
        required:true
    }
})

module.exports=mongoose.model("task",taskSchema)