
const mongoose=require("mongoose");
const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
        //enter length value
    },
    password:{
        type:String,
        required:true
    },
    created_at:{
        type:Date,
        default:Date.now(),
        required:true
    }
})

module.exports=mongoose.model("user",userSchema)