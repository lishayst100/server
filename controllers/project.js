import { Project } from "../db/schemas/Project.js";
import cloudinary from "../cloudinary/config.js";





export const getProjects = (req,res)=>{
    Project.find({})
    .then(result => res.json(result))
    .catch(e => console.log(e))
}


export const addProject = async (req, res) => {
  const { title,credits, link, linkId ,genres} = req.body;
  const images = req.files;
  console.log(genres)
  try {
    const uploadedImageURLs = [];

    // Upload images to Cloudinary and save their URLs
    for (const image of images) {
      const result = await cloudinary.uploader.upload(image.path);
      uploadedImageURLs.push(result.secure_url);
    }

    // Create a new project and save it to MongoDB
    const newProject = new Project({
      credits,
      link,
      linkId,
      title,
      images: uploadedImageURLs,
      genres
    });

    await newProject.save();

    res.status(201).json({ message: 'Project created successfully', newProject });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Error creating project' });
  }
}

export const deleteProject = async (req, res) => {

  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete images from Cloudinary
    for (const imageUrl of project.images) {
      const publicId = imageUrl.split('/').pop().split('.')[0]; // Extract public ID from Cloudinary URL
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete project from MongoDB
    await Project.findByIdAndDelete(req.params.projectId);

    res.status(200).json({ message: 'Project and associated images deleted' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Error deleting project and images' });
  }
}


export const findProjectByGenre = async (req, res) => {
  try {
    if (req.params.genre === 'all') {
    const project = await Project.find({});
      return res.status(200).json(project);
    }
    const project = await Project.find({genres: {$in : [req.params.genre]}});
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
}catch(error){
  console.error('Error finding project by genre:', error);
  res.status(500).json({ error: 'Error finding project by genre' });
}
}



export const updateProject = async(req,res)=>{
    const result = await Project.updateOne(
     {_id: req.params.id},
     {$set : req.body}
    )
    res.send(result)
   }    

export const getOneProject = (req,res) => {
    Project.findById(req.params.id)
    .then(result => res.json(result))
    .catch(e => console.log(e))
}


//get the data from the client
//find the project by id check if it exists if it does not then return 404
//get the uploded images and save them to cloudinary
//add the uploded images to array of url's images
//update the project in the DB


export const myUpdateProject = async (req,res) => {
  const { projectId } = req.params;
  const { title, credits, link, linkId ,urlImages,genres} = req.body;
  const images = req.files;
  console.log(urlImages)
  


  try {
    const project = await Project.findById(projectId)
    if(!project){
      return res.status(404).json({message: 'Project not found'})
    }

    const uploadedImageURLs = [];

    
    for (const image of images) {
      const result = await cloudinary.uploader.upload(image.path);
      uploadedImageURLs.push(result.secure_url);
    }


    if (typeof urlImages === 'string') {
      uploadedImageURLs.push(urlImages);
    } else if (Array.isArray(urlImages)) {
      uploadedImageURLs.push(...urlImages);
    }

    

    project.images = uploadedImageURLs;
    project.title = title || project.title;
    project.credits = credits || project.credits;
    project.link = link || project.link;
    project.linkId = linkId || project.linkId;
    project.genres = genres || project.genres;


    await project.save();
    res.status(200).json({message: 'Project updated successfully', updatedProject: project})




  } catch (error) {
    res.status(500).json({ errorMessage: 'Error updating project' , error: error});
  }
}