import {addMessage,updateNewTask,updateTaskStatus } from "./helperFunctions.js";
const editBtn=document.querySelector("#edit");
const editField=document.querySelector(".input-field");
let currentUrlObj=new URL(location.href);
const id=currentUrlObj.searchParams.get("id").trim();
const checkedStatus=document.querySelector("input[type=checkbox]");

//add event listener
editBtn.addEventListener("click",(e)=>{
    e.preventDefault();
    //check if both the id,editvalue are there,so that you dont submit empty fields
    const editedValue=editField.value.trim();
    if(!editedValue){
        addMessage("the task can't be empty","error");
    }else if(!id){
        addMessage("the taskId can't be empty","error");
    }else{   
        editTask(id,editField.value,checkedStatus.checked);
    }
});
checkedStatus.addEventListener('change',(e)=>{
    const completionStatus=e.target.checked;
    updateTaskStatus(completionStatus);
})
//db query
const editTask=(taskId,editedTaskInfo,completionStatus)=>{
    //sanitise this first!!!
    addMessage("editing task..........","add");
    //submit to the db
    fetch(`http://localhost:3000/api/v1?id=${taskId}`,{
        method:"put",
        headers:{
            "Accept":"application/json,text/plain",
            "Content-Type":"application/json"
        },
        body:JSON.stringify({editedTaskInfo,completionStatus})
    })
    .then(res=>res.json())
    .then(data=>{
        //edit the ui
        updateNewTask(data.newTask);
        updateTaskStatus(completionStatus);
        addMessage(data.message,"success");
       
    })
    .catch(err=>{
        errorMessage(err);
    })
}