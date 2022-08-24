
/*imports*/
import {addMessage,removeTaskUi,removeMessage,createListItem } from "./helperFunctions.js";


//dom
const submitBtn=document.querySelector("#submit");
const listItems=document.querySelector(".list-items");
const inputField=document.querySelector(".input-field");

// //add eventListeners
submitBtn.addEventListener("click",(e)=>{
    e.preventDefault();
    //get what is in the input field,but check if its not empty first
    const task=inputField.value.trim();
    if(!task){
        addMessage("task can't be empty","error");
    }else{
        submitTask(task);
    }
    
});

listItems.addEventListener("click",(e)=>{
    if(e.target.className==="delete-btn"){
        const taskId=e.target.dataset.taskid;
        const deleteBtnLiItem=e.target.parentElement;
        //check if the taskId is available
        if(taskId){
             //make a delete request
            deleteTask(deleteBtnLiItem,taskId);   
        }else{
            //make a ui message
            addMessage("The task cant be deleted,there is no task id","error");
        }
    }
  
});


/*************************db requests************************************/
const submitTask=(task)=>{
    addMessage("Adding task.......","add");
    //submit to the db
    fetch("http://localhost:3000/api/v1",{
        method:"post",
        headers:{
            "Accept":"application/json,text/plain",
            "Content-Type":"application/json"
        },
        body:JSON.stringify({task})
    })
    .then(res=>res.json())
    .then(data=>{
        addMessage(data.message,"success");
        const newTask=createListItem(data.newTask);
        listItems.appendChild(newTask);
    })
    .catch(err=>{
        addMessage(err,"error");
    })
  
};
const deleteTask=(liItemToDelete,taskId)=>{
    addMessage("Task deletion.....","add");
    //disable the delete btn for that tsk to avoid many deletions
    fetch(`http://localhost:3000/api/v1?id=${taskId}`,{
        method:"delete",
        headers:{
            "Accept":"application/json,text/plain",
            "Content-Type":"application/json"
        }
        
    })
    .then(res=>res.json())
    .then(data=>{
        //removeUi
        addMessage(data,"add");
        removeTaskUi(liItemToDelete);
    })
    .catch(err=>{
        addMessage(err,"error");
    });
}
const getTasks=()=>{
    addMessage("fetching your tasks.......","add");
    //submit to the db
    fetch("http://localhost:3000/api/v1/allTasks")
    .then(res=>res.json())
    .then(data=>{
        removeMessage();
        data.forEach(item=>{
            const createdItem=createListItem(item);
            listItems.appendChild(createdItem);
        })
    })
    .catch(err=>{
        errorMessage(err);
    })
}

getTasks();