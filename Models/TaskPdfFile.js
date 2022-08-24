
const mongoose=require("mongoose");
const User=require("./User");
const taskPdfFileSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:User,
        required:true,
        index:true
    },
    year:{
        type:String,
        required:true
    },
    months:[{
        month:String,
        filenames:Array
    }]
})

module.exports=mongoose.model("taskPdfFile",taskPdfFileSchema)