//get models
const taskModel=require("../Models/Task.js");
const taskPdfFileModel=require("../Models/TaskPdfFile.js");
const {storePdfFileLocally,insertTaskPdfNameToDb,deletePdfFile,deletePdfFromDb}=require("../utilities/utilities.js");



const getAllTasks=(req,res)=>{

    //get id from logged user jwt
    taskModel.find({userId:req.user.id},{userId:0})
    .then((tasks)=>{
        if(!tasks){
            res.status(401).json({message:`tasks fetching failed!!!!`});
            return;
        }
        res.status(200).json(tasks);
    })
    .catch(err=>{
        res.status(503).json({error:true,message:"Tasks couldn't be fetched,try again later"});
    })
    
}
const getTask=(req,res)=>{
    const {id:task_Id}=(req.params);
    taskModel.findOne({_id:task_Id,userId:req.user.id}) //returns an object
    .then((task)=>{

        if(!task){
            res.status(204).json({error:true,message:"task fetching failed!"});
            return;
        }
        res.status(200).json(task);
    })
    .catch(err=>{
        if(err.name==="CastError"){
            //task id not found in the id's or the task id length was messed   
            res.status(400).json({message:"Task couldn't be fetched,the id number is not available"});
            return
        }
        //server error
        res.status(503).json({error:true,message:"Task couldn't be fetched,try again later"});
    })
}
const addTask=(req,res)=>{
    const task= req.body.taskName;
    //add to db
    const newTask=new taskModel({
        userId:req.user.id,
        taskName:task
    });
    newTask.save()
    .then((task)=>{
        if(!task){
            res.status(201).json({error:true,message:`task creation failed!!!!`});
            return;
        }
        res.status(201).json({task,message:`a new task was added`});
    })
    .catch(err=>{
        res.status(400).json({error:true,message:err.message});
    })
}
const updateTask=(req,res)=>{

    const {id:task_Id}=req.params;
    const {taskName:editedTaskInfo,completed:completionStatus}= req.body;
    ///make a db put query(using task id)
    taskModel.findOneAndUpdate(
            { $and:[{_id:task_Id},{userId:req.user.id}]},
            {$set:{taskName:editedTaskInfo,completed:completionStatus}}
            
    )
    .then(task=>{
        if(!task){
            //the task was not updated
            res.status(401).json({error:true,message:"task was not updated!"});
            return;
        }
        res.status(202).json({message:"task successfully updated"});
    })
    .catch(err=>{
        
        if(err.name==="CastError"){
            res.status(404).json({error:err.name,message:"Task id to be edited was not found"});
            return;
        }
        //server error
        res.status(500).json({error:err,message:"Task couldn't be updated,try again later"});
        
    })
           
    
    
}
const deleteTask=(req,res)=>{
    const {id:task_Id}=req.query;
    ///make a db delete query(using task id)
   
    taskModel.deleteOne({
        _id:task_Id,userId:req.user.id
    })
    .then((task)=>{
        if(task.deletedCount===0){
            //throw an error here,so that the user sees red on the other end
            res.status(401).json(`task deletion failed!!`);
            return;
        }
        res.status(202).json(`${task.deletedCount} task was successfully deleted!!`);
    })
    .catch(err=>{
       
        if(err.name==="CastError"){
            //task id not found in the id's or the task id length was messed   
            res.status(400).json({message:"Task couldn't be deleted,the id number is not available"});
            return
        }
         
        //server error
        res.status(500).json({message:"Task couldn't be deleted,try again later"}); 
    })
}
const savePdf= async (req,res)=>{
     try {
        //move this to utilities
        const tasks= await taskModel.find({userId:req.user.id},{_id:0,taskName:1,completed:1,created_at:1})
        if(tasks.length<1){
            res.status(200).json({empty:true,message:`there are no tasks to print to pdf!!!!`});
            return;
        }
        const localFileRoute=storePdfFileLocally(tasks,req.user.id);
        const dbFileRouteStorage=await insertTaskPdfNameToDb(localFileRoute,req.user.id);
        //wat if the dbstorage fails?
        if(!dbFileRouteStorage){
            console.log("db storage failed");
            //throw error here!
        };
        //send the feedback to frontend that pdf is stored
        res.status(200).json({empty:false,message:"pdf successfully saved"});
         } 
    catch (error) {
        console.log(error);
        res.status(503).json({error:true,message:error.message});
    }
    
}

const getPdfList=async(req,res)=>{
    try{
        //the year will provided by the user so tht its fast to fetch data and also ensures tht the array will always contain 1 doc 
        const pdfRoutes=await taskPdfFileModel.find({userId:req.user.id},{userId:0,__v:0});
        res.status(200).json(pdfRoutes);
    }catch(err){
        res.status(500).json({error:err.message});
    }
}

const downloadPdf=(req,res)=>{

    const {year,month,fileName}=req.query;
    //check if all are present
    // if(!year || !month || !fileName){ res.status(404).json({})}
    const userId=req.user.id;
    const fileRoute=`./userTasksPdf/${userId}/${year}/${month}/${fileName}`;
    //send the new created pdf to the frontend
    res.download(fileRoute);
}

const deletePdf=async (req,res)=>{
    try {
        const {year,month,fileName}=req.query;
        const userId=req.user.id;
        const fileRoute=`./userTasksPdf/${userId}/${year}/${month}/${fileName}`;
        //delete in the db 1st
        const deletedPdfFile=await deletePdfFromDb(fileRoute,userId);
        // check if it was deleted in the db successfully
        
        if(deletedPdfFile){
            //delete in the file system
            await deletePdfFile(fileRoute);
            res.status(200).json({message:"pdf successfully deleted!"});
        }else{
            //there was an error,throw it
            throw new Error("File not deleted");
        }
   } catch (error) {
        res.status(500).json({error:error.message,message:"File not deleted"});
   }
  
}
module.exports={getAllTasks,getTask,addTask,updateTask,deleteTask,savePdf,getPdfList,downloadPdf,deletePdf};