
const express=require('express');
const router=express.Router();
const {getAllTasks,addTask,getTask,updateTask,deleteTask,savePdf,getPdfList,downloadPdf,deletePdf}=require("../controllers/tasksControllers");
const {authorize}=require("../middleware/auth.js");


router.use(authorize);
router.get("/allTasks",getAllTasks);
router.get("/savePdf",savePdf);
router.get("/getPdfList",getPdfList);
router.get("/downloadPdf",downloadPdf);
router.get("/:id",getTask);
router.post("/",addTask);
router.put("/:id",updateTask);
router.delete("/",deleteTask);
router.delete("/deletePdf",deletePdf);

module.exports=router;