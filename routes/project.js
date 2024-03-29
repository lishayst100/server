import { Router } from "express";
import {  deleteProject, getProjects,getOneProject, addProject, myUpdateProject, findProjectByGenre } from "../controllers/project.js";
import multer from "multer";

const router = Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'tmp/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100000000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|heic)$/)) {
      return cb(new Error('Error upload file'));
    }
    cb(undefined, true);
  },
});

router.get('/getProjects',getProjects)

router.get('/getOneProject/:id',getOneProject)

router.get('/findProjectByGenre/:genre', findProjectByGenre)

router.delete('/deleteProject/:projectId', deleteProject);

router.post('/addProject',upload.array('images') , addProject);

router.put('/myUpdateProject/:projectId', upload.array('images'), myUpdateProject);


export default router;


export {router as projectRouter}


