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

router.post('/addProject', upload.array('images'), addProject);

router.put('/myUpdateProject/:projectId', upload.array('images'), myUpdateProject);

router.put('/updateProject/:projectId', upload.array('images'), async (req, res) => {
  const { projectId } = req.params;
  const { title, credits, link, linkId } = req.body;
  const images = req.files;


  console.log('Received Project ID:', projectId);
  console.log('Received Title:', title);
  console.log('Received Credits:', credits);
  console.log('Received Link:', link);
  console.log('Received Link ID:', linkId);
  console.log('Received Images:', images); // Check if this shows the uploaded files

  // Check if FormData is empty or missing required data
  if (!projectId || !title || !credits || !link || !linkId || !images) {
    return res.status(400).json({ message: 'Incomplete data received' });
  }


  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete existing images from Cloudinary
    for (const imageUrl of project.images) {
      const publicId = imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Upload and update new images in Cloudinary
    const uploadedImageURLs = [];
    for (const image of images) {
      const result = await cloudinary.uploader.upload(image.buffer);
      uploadedImageURLs.push(result.secure_url);
    }

    // Update project details and images in MongoDB
    project.title = title;
    project.credits = credits;
    project.link = link;
    project.linkId = linkId;
    project.images = uploadedImageURLs;

    await project.save();

    res.status(200).json({ message: 'Project updated successfully', updatedProject: project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Error updating project and images' });
  }
});

router.put('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, credits, photos, link,linkId } = req.body;

    // Find the project by ID
    const project = await Project.findById(id);

    // Update the project fields
    project.title = title;
    project.credits = credits;
    project.photos = photos;
    project.link = link;
    project.linkId = linkId;

    // Save the updated project
    await project.save();

    // Upload new photos to Cloudinary
    const uploadedPhotos = await Promise.all(
      photos.map((photo) => cloudinary.uploader.upload(photo))
    );

    // Update the project's photo URLs with the Cloudinary URLs
    project.photos = uploadedPhotos.map((photo) => photo.secure_url);

    // Save the project with the updated photo URLs
    await project.save();

    res.status(200).json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the project' });
  }
});


router.put('/:id', upload.array('images', 5), async (req, res) => {
  const projectId = req.params.id;
  const { title, credits, linkId, link } = req.body;
  const images = req.files || [];

  try {
    const project = await Project.findById(projectId);

    // Update project details
    project.title = title || project.title;
    project.credits = credits || project.credits;
    project.linkId = linkId || project.linkId;
    project.link = link || project.link;

    // Upload and update images to Cloudinary
    const uploadedImageUrls = [];
    for (const image of images) {
      const result = await cloudinary.uploader.upload(image.buffer);
      uploadedImageUrls.push(result.secure_url);
    }

    // Update the project's imageUrls with newly uploaded image URLs
    project.images = [...project.images, ...uploadedImageUrls];

    await project.save();

    res.json({ updatedProject: project });
  } catch (error) {
    res.status(500).json({ error: 'Error updating project' });
  }
});


// Route for creating a new project with images


export default router;


export {router as projectRouter}


