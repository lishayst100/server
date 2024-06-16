import { Router } from "express";
import {  deleteProject, getProjects,getOneProject, addProject, myUpdateProject, findProjectByGenre } from "../controllers/project.js";
import multer from "multer";
import { imagekit } from "../cloudinary/imageKit.js";
import fsPromises from 'fs/promises'
import fs from 'fs';
import path from 'path';

const router = Router()




// Ensure the tmp directory exists
const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tmpDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|mp4)$/)) {
      return cb(new Error('Error uploading file: Invalid file type.'));
    }
    cb(undefined, true);
  },
});

const uploadFields = [
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 },
  { name: 'supplementaryVideos', maxCount: 5 },
  { name: 'frontImage', maxCount: 1 },
];

router.get('/getProjects',getProjects)

router.get('/getOneProject/:id',getOneProject)

router.get('/findProjectByGenre/:genre', findProjectByGenre)

router.delete('/deleteProject/:projectId', deleteProject);

router.post('/addProject', upload.fields(uploadFields), (req, res, next) => {
  upload.fields(uploadFields)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Handle multer-specific errors
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // Handle other errors
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, addProject);

router.put('/myUpdateProject/:projectId', upload.fields(uploadFields), myUpdateProject);


export default router;


export {router as projectRouter}


