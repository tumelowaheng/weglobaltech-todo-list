const message=document.querySelector(".message");
const paragraph=document.createElement("p");
const inputField=document.querySelector(".input-field");
const listItems=document.querySelector(".list-items");
const taskParagraph=document.querySelector("#taskName");
const completionStatusParagraph=document.querySelector("#completionStatus");

//functions
const addMessage=(messageToDisplay,status)=>{
    //clear the input area
    inputField.value="";
    paragraph.innerText=messageToDisplay;
    message.appendChild(paragraph);
    message.classList.remove("clear");
    if(status==="success"){
        message.classList.add("success");
        setTimeout(() => {
            message.classList.remove("success");
            message.classList.add("clear");
        }, 2000);
    }else if(status==="error"){
        message.classList.add("error");
        setTimeout(() => {
            message.classList.remove("error");
            message.classList.add("clear");
        }, 2000);
    }else if(status==="add"){
        message.classList.add("remove");
        setTimeout(() => {
            message.classList.remove("remove");
            message.classList.add("clear");
        }, 2000);
    }
}
const removeMessage=()=>{
    message.classList.add("clear");
}
const createListItem=(task)=>{
    const listItem=document.createElement("li");
    listItem.classList.add("item");
    const listItemInner=`
        <div class="item-div">
            <p> ${task.taskName}</p>
        </div>
        <a href="/edit?id=${task._id}" class="edit-btn" data-taskId=${task._id}>Edit</a>
        <button class="delete-btn" data-taskId=${task._id}>Delete</button>
    `
    listItem.innerHTML=listItemInner;
    return listItem;
}
const removeTaskUi=(liItemToDelete)=>{
    listItems.removeChild(liItemToDelete);
}

const updateNewTask=(newTaskInfo)=>{
    taskParagraph.innerText=newTaskInfo;

}
const updateTaskStatus=(completionStatus)=>{
    completionStatusParagraph.innerText=completionStatus;
}


export  {addMessage,removeMessage,createListItem,removeTaskUi,updateNewTask,updateTaskStatus}



