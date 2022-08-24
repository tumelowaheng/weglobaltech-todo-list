require("dotenv").config();
const jwt=require("jsonwebtoken");
const {getAccessToken}=require("../utilities/utilities");
const Token=require("../Models/Token.js");

const authorize=(req,res,next)=>{

    //check for authorisation by checking the jwt
    const accessToken=req.cookies.accessToken;
    const refreshToken=req.cookies.refreshToken;
    if(accessToken){

        jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET,(err,loggedUser)=>{
            if(err?.message==="jwt expired"){
                console.log("jwt has expired!!")
                //the access token has expired
                if(refreshToken){
                    
                    //check if the refreshtoken is valid 1st before u can query the db
                    jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET,(err,loggedUser)=>{
                        if(err){
                            //the refreshtoken is bad
                            console.log("the refresh token from cookie is bad!!");
                            return res.status(401).json({error:true,message:"Unauthorised"})
                        }
                        //check if the refreshtoken is still valid in db
                        Token.findOne({token:refreshToken,validity:true})
                        .then(token=>{
                            if(token){
                                //the token exists
                                //produce another accesstoken
                                const accessToken=getAccessToken(loggedUser);
                                //u need to send the new accesstoken to client,then pass to the next middleware
                                res.cookie("accessToken",accessToken,{secure:false,httpOnly:true,path:"/",SameSite:"lax",maxAge:(5*60*1000)});
                                req.user=loggedUser; //this loggeduser is the old one,get a new one from accesstoken creation
                                next(); 
                            }else{
                                console.log("the refresh token in db is blacklisted!!");
                                throw new Error("refresh token blacklisted");
                            }
                                    
                        })
                        .catch(err=>{
                            //the refresh token is blacklisted in db
                            return res.status(401).json({error:true,message:"Unauthorised"})
                        })

                    }) 
                    
                    
                }else{
                    //the refreshtoken header is not there!
                    console.log("refreshtoken not in cookie!!");
                    return res.status(401).json({error:true,message:"Unauthorised"})
                }

            }else if(err){
                //its something else other than expired jwt
                console.log("access token failed verification");
                return res.status(401).json({error:true,message:"Unauthorised"});
            }else{
                console.log("everything is fine");
                req.user=loggedUser;
                next();
            }   
        })
        
    }else{
        //there is no cookie/headers
        console.log("there are no accesstoken cookies in the headers,cud have expired or was never set");
       return res.status(401).json({error:true,message:"Unauthorised"});
    }
     
}
module.exports={authorize};