import { Router } from "express";
import {  deleteProject, getProjects,getOneProject, addProject, myUpdateProject, findProjectByGenre } from "../controllers/project.js";
import multer from "multer";
import { imagekit } from "../cloudinary/imageKit.js";
import fsPromises from 'fs/promises'

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
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|mp4)$/)) {
      return cb(new Error('Error upload file'));
    }
    cb(undefined, true);
  },
});


const uploadFields = [
  { name: 'video', maxCount: 1 }, // For the video
  { name: 'images', maxCount: 12 },  // For the images
  { name: 'supplementaryVideos', maxCount: 10 },
  {name: 'frontImage', maxCount:1}
];

router.post('/upload/video', upload.fields(uploadFields), async(req, res) => {
  const videoFile = req.files['video'][0]; // Get the video file
  const imageFiles = req.files['images']; // Get the array of image files
  try {
    const fileBuffer = await fsPromises.readFile(videoFile.path);
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: videoFile.originalname,
      useUniqueFileName: false,
    });

    console.log('Video uploaded to ImageKit:', response);

    // Handle any further processing or response to the client
    res.send('Video uploaded to ImageKit successfully!');
  } catch (error) {
    console.error('Error uploading video to ImageKit:', error);
    res.status(500).send('Error uploading video to ImageKit');
  }
});

router.get('/getProjects',getProjects)

router.get('/getOneProject/:id',getOneProject)

router.get('/findProjectByGenre/:genre', findProjectByGenre)

router.delete('/deleteProject/:projectId', deleteProject);

router.post('/addProject',upload.fields(uploadFields) , addProject);

router.put('/myUpdateProject/:projectId', upload.fields(uploadFields), myUpdateProject);


export default router;


export {router as projectRouter}


