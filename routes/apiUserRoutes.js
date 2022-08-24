require("dotenv").config();
const express=require('express');
const router=express.Router();
const {getAllUsers,getUser,addUser,updateUser,deleteUser,signInUser,signOutUser}=require("../controllers/usersControllers");
const {check}=require("express-validator");
const {authorize}=require("../middleware/auth.js");



router.post("/signup",[
    check("username")
        .notEmpty().withMessage("Provide Username")
        .isEmail().withMessage("Username is not an email"),
    check("password")
        .notEmpty().withMessage("Provide Password")
        .isLength({min:5}).withMessage("Password has to be 5 characters")

],addUser);

router.post("/signin",[
    check("username")
        .notEmpty().withMessage("Provide Username")
        .isEmail().withMessage("Username is not an email"),
    check("password")
        .notEmpty().withMessage("Provide Password")
        .isLength({min:5}).withMessage("Password has to be 5 characters")

],signInUser);



//these ones need authorisation,put them all under middleware
router.use(authorize);
router.get("/signout",signOutUser);
router.get("/allUsers",getAllUsers);
router.get("/:id",getUser);
router.put("/:action/:id",updateUser);
router.delete("/:id",deleteUser);


module.exports=router;