require("dotenv").config();
const PDFDocument = require("pdfkit");
const fs=require("fs");
const jwt=require("jsonwebtoken");


//Models
const taskPdfModel=require("../Models/TaskPdfFile.js");




//used to create a user's pdf
function createPdf(fileRoute,userId,data){
    
    const stream=fs.createWriteStream(fileRoute);
    let doc=new PDFDocument();
    doc.pipe(stream);
    doc.text(`User Id: ${userId}`,10,10);
    doc.text(`Below are your tasks:`,10,30);
    doc.text(data);
    doc.moveDown(0.5);
    doc.end();

    
}
async function deletePdfFile(path){
    fs.unlink(path,(err)=>{
        if(err){
            //throw an err here

            console.log(err);
            throw new Error(err.message);
        }
    });
} 
function getMonth(monthNumber){
    const monthArr=['January','February','March','April','May','June','July','August','September','October','November','December'];
    return monthArr[monthNumber];
}
async function insertTaskPdfNameToDb(fileRoute,userId){
    const arr=fileRoute.split("/");
    //get variables
    const year=arr[3];
    const month=arr[4];
    const filename=arr[5];
    
    //********************************test
    // const year="2021";
    // const month="August";
    // const filename="2021AugustTest1.pdf";

    //********************************test



    //check if the route is already in the db e.g year,month
    const taskStorage=await taskPdfModel.findOne({userId,year})
    if(taskStorage){
        // it means the months array was created wth previous new obj 
        //so u hv t check for the obj wth month in the months array
        const specificMonth=taskStorage.months.find(obj=>obj.month===month);
        
        //if specific month is available,add new file to the existing files array 
        if(!specificMonth){
            // the specific file is not there
            //add the new month to the months array 
            return taskPdfModel.updateOne(
                {
                    userId:userId,
                    year:year
                },
                {
                    $push:{months:{month,filenames:[filename]}}
                
                },
            )

        }else if(specificMonth.filenames.length===5){
            //you cant continue
            throw new Error("You can't store any more pdf's,you reached limit.");
        }else{
            return taskPdfModel.findOneAndUpdate(
                {
                    userId,
                    year,
                    "months.month":month
                },
                {
                    $push:{"months.$.filenames":filename}
                
                },
                // {new:true,upsert:true,rawResult:true}
            )
        }
        
    }else{

        //the obj is nt there
        const taskPdf=new taskPdfModel({
            userId,
            year,
            months:[{month,fileNames:[filename]}]
        })

       return taskPdf.save()
    }
    
   
  
}
async function deletePdfFromDb(fileRoute,userId){
        const arr=fileRoute.split("/");
        //get variables
        const year=arr[3];
        const month=arr[4];
        const filename=arr[5];
        const tasksObj=await taskPdfModel.findOneAndUpdate(
            {userId,year,"months.month":month},
            {$pull:{"months.$.filenames":filename}},
            {new:true} //dont this mean anything to the findOneAndUpdate function?
        )
        //get the current month been worked on
        const currentMonthObj=tasksObj.months.find(monthObj=>monthObj.month===month);
        //check the current month filenames array length
        const filenamesLength=currentMonthObj.filenames.length;
        if(tasksObj && !filenamesLength){
            //the filenames array is empty,then remove the obj
            const cleanedTasksMonthsArr= await taskPdfModel.findOneAndUpdate(
                //use the taskObj id,to get straight to the obj faster  
                {_id:tasksObj.id},
                 //use the current month id,to get straight to the obj faster  
                {$pull:{months:{_id:currentMonthObj._id}}})

            if(cleanedTasksMonthsArr){
                return 1;
            }else{
                //the obj couldnt be cleaned,but remember the file is already deleted
                //make this whole thing atomic
                console.log("i was not cleaned")
                return 1;//for now
            }
        }else if(tasksObj && filenamesLength){
            //pdf filename deleted
            return 1;
        
        }else{
            // file was not deleted
            return 0
        }  
}
function storePdfFileLocally(data,userId){
    //create a folder for use if its not there
    const userFolder=`./userTasksPdf/${userId}`;
    const date=new Date();
    const yearFolder=`${userFolder}/${date.getFullYear()}`;
    const monthFolder=`${yearFolder}/${getMonth(date.getMonth())}`;
    const timeStamp=date.getTime();
    const fileRoute=`${monthFolder}/${timeStamp}.pdf`; 
   
    /**testing*/
    // const yearFolder=`${userFolder}/2021`;
    // const monthFolder=`${yearFolder}/August`;
    // const fileRoute=`${monthFolder}/2021AugustTest1.pdf`;

    /**testing*/



    //check availability of directory
    if(!fs.existsSync(userFolder)){ //user dir not there,create it
        // create a user folder  
        fs.mkdir(userFolder,(err)=>{
            if(err){
                console.log(err);
                return;
            }
           // create a year folder     
            fs.mkdir(yearFolder,(err)=>{
                if(err){console.log(err);
                    return;
                }
                //create a month folder 
                fs.mkdir(monthFolder,(err)=>{
                    if(err){console.log(err);
                        return;
                    }
                    //create the pdf
                    createPdf(fileRoute,userId,data);
                })

            })

        });

    }else if(!fs.existsSync(`${yearFolder}`)){ //check if the year folder is not there,thn create it
        fs.mkdir(`${yearFolder}`,(err)=>{ 
            if(err){
                console.log(err);
                return;
            }
            //create a month folder 
            fs.mkdir(monthFolder,(err)=>{
                if(err){console.log(err);
                    return;
                }
                //create the pdf
                createPdf(fileRoute,userId,data);
            })
        })
        
    }else if(!fs.existsSync(`${monthFolder}`)){//check if month is not there,if not create it
        fs.mkdir(`${monthFolder}`,(err)=>{ 
            if(err){
                console.log(err);
                return;
            }
            //create the pdf
            createPdf(fileRoute,userId,data); 
        })
    }else{
        //isnt this a promise??    
        createPdf(fileRoute,userId,data);  
    } 

    //shudnt u somewat get this route from created file,whcih will ensure it retun smthng tht was successful!!
    return fileRoute;
}
function getAccessToken(loggedUser){
    //twitch the loggedUser a bit coz its an object tht brings some properties  that may conflict
    const accessToken=jwt.sign({id:loggedUser.id},process.env.ACCESS_TOKEN_SECRET,{
                        expiresIn:"10s"
                        });

    return accessToken;
}

module.exports={storePdfFileLocally,insertTaskPdfNameToDb,getAccessToken,deletePdfFile,deletePdfFromDb};