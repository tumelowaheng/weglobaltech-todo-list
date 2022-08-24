
const mongoose=require("mongoose");
const User=require("./User");
const tokenSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:User,
        required:true,
        index:true
    },token:{
        type:String,
        required:true,
        unique:true
        //enter length value
    },
    validity:{
        type:String,
        default:true
    },
    created_at:{
        type:Date,
        default:Date.now(),
        required:true
    }
})

module.exports=mongoose.model("token",tokenSchema)