require("dotenv").config();
const express=require('express');
const app=express();
const apiTaskRoutes=require('./routes/apiTaskRoutes');
const apiUserRoutes=require('./routes/apiUserRoutes');
const dbConnect=require("./config/dbConnect");
const cors=require("cors");
const cookie=require("cookie-parser");


//******************************middlewares***********************//
app.use(cookie());
//cors
app.use(cors(
    {
    origin:["http://localhost:3000","https://weglobaltech-todolist.netlify.app"],
    method:["GET","POST","DELETE","PUT","PATCH"],
    credentials:true
}
)); 
app.use(express.json()); 
app.use(express.urlencoded({extended:true}));
 
//a landing page for the app
app.get("/",(req,res)=>{res.send("welcome to the app sir")})

/*****************************route****************************/
app.use("/api/v1/task",apiTaskRoutes);
app.use("/api/v1/user",apiUserRoutes);
app.use((req,res)=>{ res.send("Error page");}) 


// dbConnect("mongodb://localhost/todo") //returns a promise
// .then(()=>{

//     const port=process.env.PORT || 5000;
//     app.listen(port,()=>{
//         console.log(`listening on port ${port}`);
//     })
// })
// .catch(err=>console.log(err))


dbConnect(`mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@todolist.szrrhnb.mongodb.net/?retryWrites=true&w=majority`)
.then(()=>{
    const port=process.env.PORT || 5000;
    app.listen(port,()=>{
        console.log(`listening on port ${port}`);
    })

})
.catch(err=>console.log(err))