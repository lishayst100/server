import { Router } from "express";
import {  deleteProject, getProjects, updateProject,getOneProject, addProject, myUpdateProject } from "../controllers/project.js";
import multer from "multer";
import { Project } from "../db/schemas/Project.js";
import cloudinary from "../cloudinary/config.js";


const router = Router()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now();
      cb(null, uniqueSuffix + file.originalname);
    },
  });
  
  const upload = multer({ storage: storage ,fileField: 'images', limits:{
    fileSize:100000000000,
    
  },
    fileFilter(req,file,cb){
      if(!file.originalname.match(/\.(png|jpg)$/)){
        return cb(new Error('Error upload file'))
      }
      cb(undefined,true)
    }
  });

router.get('/getProjects',getProjects)

router.get('/getOneProject/:id',getOneProject)

router.delete('/deleteProject/:projectId', deleteProject);

router.post('/addProject',upload.array('images'),  addProject);

router.put('/myUpdateProject/:projectId', upload.array('images'), myUpdateProject);


export default router;


export {router as projectRouter}


