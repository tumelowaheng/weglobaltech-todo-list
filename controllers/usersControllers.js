
require("dotenv").config();
const User=require("../Models/User.js");
const Token=require("../Models/Token.js");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const {validationResult}=require("express-validator");


const addUser=(req,res)=>{
   //validation errors
   const errorsArr=validationResult(req);
   if(!errorsArr.isEmpty()){
      return res.status(400).json({error:true,message:errorsArr});
   }

   const {username:providedUsername,password:providedPassword}=req.body;
   //sanitise the data
    //check if user doesnt already exist on db

    User.findOne({username:providedUsername})
    .then(user=>{

      if(user){ 
         throw new Error("username already in use");
      }

      //there is no user with same username,continue
      //generate salt
      return bcrypt.genSalt()
    }) 
   .then(salt=>{
      return bcrypt.hash(providedPassword,salt)
   })
   .then(hashedPassword=>{
      
      //enter the user in the db
      const newUser=new User({username:providedUsername,password:hashedPassword});
      return newUser.save();

   })
   .then(newUser=>{
      //send the jwt to the new user
      const loggedUser={id:newUser._id};
      const accessToken=jwt.sign(loggedUser,process.env.ACCESS_TOKEN_SECRET,{expiresIn:"1hr"});
      //send via cookies
      
      res.status(200).json({token:accessToken,message:"User successfully created"}); 
   
   })
   .catch(err=>{
    
      if(err && err.name==="CastError"){
         res.status(404).json({error:err.name,message:"Validation error!!"});
         return;
      }else if(err.message="username already in use"){
         //the user already exists
         res.status(401).json({error:true,message:err.message});
      }else{
         //server error
         res.status(500).json({error:true,message:"User couldn't be created,try again later"});
      }
   }) 
}
const signInUser=async (req,res)=>{
  
  try {
      //validation errors
   const errors=validationResult(req);
   if(!errors.isEmpty()){ throw new Error(errors);}
   const {username:enteredUsername,password:enteredPassword}=req.body;
   const foundUser= await User.findOne({username:enteredUsername})
   if(foundUser){
      //user is there,so get their hashed password to compare
      const hashedPassword=foundUser.password;
      //notice tht bcrypt takes the salt from the password
      const results=await bcrypt.compare(enteredPassword,hashedPassword);
      if(results){

         //create a jwt here since the user is available an its right credentials
         const loggedUser={id:foundUser._id};
         //create tokens
         //this can be outsourced to utilityfunctions 
         const accessToken=jwt.sign(loggedUser,process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:"5min"
         });
         const refreshToken=jwt.sign(loggedUser,process.env.REFRESH_TOKEN_SECRET,{
            expiresIn:"1y"
         });
         //send the token to db
         const token=new Token({userId:foundUser._id,token:refreshToken});
         token.save()
         .then(()=>{
            //send the token in cookie to the front end 
            // res.cookie("accessToken",accessToken,{secure:true,httpOnly:true,domain:"localhost",path:"/",SameSite:"none",maxAge:(5*60*60*1000)});
            // res.cookie("refreshToken",refreshToken,{secure:true,httpOnly:true,domain:"localhost",path:"/",SameSite:"none",maxAge:(1*365*24*60*60*1000)});
            // res.cookie("accessToken",accessToken,{secure:true,httpOnly:true,domain:"https://weglobaltech-todo-list.herokuapp.com",path:"/",SameSite:"none",maxAge:(5*60*60*1000)});
            // res.cookie("refreshToken",refreshToken,{secure:true,httpOnly:true,domain:"https://weglobaltech-todo-list.herokuapp.com",path:"/",SameSite:"none",maxAge:(1*365*24*60*60*1000)});
            // res.cookie("accessToken",accessToken,{secure:true,httpOnly:true,domain:"https://weglobaltech-todolist.netlify.app",path:"/",SameSite:"none",maxAge:(5*60*60*1000)});
            // res.cookie("refreshToken",refreshToken,{secure:true,httpOnly:true,domain:"https://weglobaltech-todolist.netlify.app",path:"/",SameSite:"none",maxAge:(1*365*24*60*60*1000)});
            res.cookie("accessToken",accessToken,{secure:true,httpOnly:true,path:"/",SameSite:"none",maxAge:(5*60*60*1000)});
            res.cookie("refreshToken",refreshToken,{secure:true,httpOnly:true,path:"/",SameSite:"none",maxAge:(1*365*24*60*60*1000)});
            res.status(200).json({accessToken,refreshToken});
            
         })
         .catch(err=>{
            res.status(400).json({error:true,message:err.message});
         }) 
      }else{
         //the credentials are wrong
         throw new Error("user credentials are wrong!!");
      }
 
   }else{
         //the credentials are wrong
         throw new Error("user credentials are wrong!!");    
   }

  } catch (err) {
      res.status(400).json({error:true,message:err.message});
  }
  
}
const signOutUser=(req,res)=>{
   //u get here when u have been authorised
      //get the token to destroy it
      const accessToken=req.cookies.accessToken;
      const refreshToken=req.cookies.refreshToken;
            //go to the db and change the validity to false

            //check if the cookies are there
      if(accessToken && refreshToken){
         Token.findOneAndUpdate(
            {token:refreshToken},
            {$set:{validity:false}}
         )
         .then(()=>{
            res.cookie("accessToken",accessToken,{secure:true,httpOnly:true,path:"/",SameSite:"lax",maxAge:(-1000)});
            res.cookie("refreshToken",refreshToken,{secure:true,httpOnly:true,path:"/",SameSite:"None",maxAge:(-1000)});
            // res.status(200).redirect("/signin");
            res.status(200).json({error:true,message:"logged out"});
         })
         .catch((err)=>{
            console.log(err)
            res.status(401).json({error:true,message:"Unauthorised"});
         })

     }else{
         res.status(401).json({error:true,message:"Unauthorised"});
     }   
}
const getAllUsers=(req,res)=>{
  
   User.find({})
   .then(users=>{
      if(users.length===0){
         //throw an error
         res.status(404).json({message:"Users not found!!"})
         return;
      }
      res.status(200).json(users);
   })
   .catch(err=>{console.log(err)})
}
const getUser=(req,res)=>{
   const {id:userId}=req.params;
   User.findById({_id:userId})
   .then(user=>{
      if(!user){
         //throw an error
         res.status(404).json({message:"User not found!!"})
         return;
      }
      res.status(200).json(user);
   })
   .catch(err=>{console.log(err)})
}
const updateUser=(req,res)=>{
   const {action,id:userId}=req.params;
   console.log(userId);
   if(action==="passwordUpdate"){
      //user wants to update a password
      const {oldPassword,newPassword}=req.body;
      console.log(oldPassword,newPassword);
      User.find(
         {$and:[{_id:userId},{password:oldPassword}]},
         {$set:{password:newPassword}})
      .then(user=>{
         res.status(200).json({user,message:"Password updated successfully!!"});
      })
      .catch(err=>{
         res.status(404).json({message:"Password update request failed!! enter correct old password"});
      })
   }else{
      res.status(404).json({message:"Action not known"});
   }
   
}
const deleteUser=(req,res)=>{
   const {id:userId}=req.params;
   User.findByIdAndDelete({_id:userId})
   .then(user=>{
      res.status(200).json({message:`User ${user.username} successfully deleted`});
   })
   .catch(err=>{console.log(err)})
}


module.exports={getAllUsers,getUser,addUser,updateUser,deleteUser,signInUser,signOutUser};