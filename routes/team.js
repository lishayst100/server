import { Router } from "express";
import { Team } from "../db/schemas/Team.js";
import cloudinary from "../cloudinary/config.js";
import multer from "multer";
import util from 'util';
import fs from 'fs';
import { imagekit } from "../cloudinary/imageKit.js";
import fsPromises from 'fs/promises'

const unlinkFile = util.promisify(fs.unlink);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "tmp/");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now();
      cb(null, uniqueSuffix + file.originalname);
    },
  });
  
 export const upload = multer({
    storage: storage,
    fileField: "images",
    limits: {
      fileSize: 100000000000,
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(png|jpg|jpeg|heic)$/)) {
        return cb(new Error("Error upload file"));
      }
      cb(undefined, true);
    },
  });

const router = Router()



router.get('/', (req, res) => {
    Team.find({})
    .then(result => res.json(result))
    .catch(e => console.log(e))
})


router.get('/:id', (req, res) => {
    Team.findById(req.params.id)
    .then(result => res.json(result))
    .catch(e => console.log(e))
})


router.post(
    "/addTeam",
    upload.array("images"),
    async (req, res) => {
      const images = req.files;
      const {name,title,desc } = req.body
  
      try {
        const uploadedImageURLs = [];
        for (const image of images) {
          const fileBuffer = await fsPromises.readFile(image.path);
          const result = await imagekit
            .upload({ fileName: image.path, isPrivateFile: false ,file:fileBuffer})
            uploadedImageURLs.push(result.url)
        }
  
        const newTeam = new Team({
          name:name,
          desc:desc,
          img: uploadedImageURLs,
          title:title
        });
  
        await newTeam.save();


        for (const image of images) {
            await unlinkFile(image.path);
          }
  
        res
          .status(200)
          .json({ message: "Team created successfully", newTeam });
      } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ error: "Error creating project" });
      }
    }
  );


router.delete('/deleteTeam/:id', async (req, res) => {

    try {
      const team = await Team.findById(req.params.id);
  
      if (!team) {
        return res.status(404).json({ message: 'team not found' });
      }
  
      // Delete images from Cloudinary
      for (const imageUrl of team.img) {
        const publicId = imageUrl.split('/').pop().split('.')[0]; // Extract public ID from Cloudinary URL
        await cloudinary.uploader.destroy(publicId);
      }
  
      // Delete team from MongoDB
      await Team.findByIdAndDelete(req.params.id);
  
      res.status(200).json({ message: 'team and associated images deleted' });
    } catch (error) {
      console.error('Error deleting team:', error);
      res.status(500).json({ error: 'Error deleting team and images' });
    }
  })


router.put('/updateTeam/:teamId', upload.array('images'),async (req,res) => {
    const { teamId } = req.params;
    const { title, name ,desc ,urlImages} = req.body;
    const images = req.files;
    
    
  
  
    try {
      const team = await Team.findById(teamId)
      if(!team){
        return res.status(404).json({message: 'team not found'})
      }
  
      const uploadedImageURLs = [];
  
      
      for (const image of images) {
        const fileBuffer = await fsPromises.readFile(image.path);
        const result = await imagekit
          .upload({ fileName: image.path, isPrivateFile: false ,file:fileBuffer})
          uploadedImageURLs.push(result.url)
      }
  
  
      if (typeof urlImages === 'string') {
        uploadedImageURLs.push(urlImages);
      } else if (Array.isArray(urlImages)) {
        uploadedImageURLs.push(...urlImages);
      }
  
      
  
      team.img = uploadedImageURLs;
      team.title = title || team.title;
      team.name = name || team.name;
      team.desc = desc || team.desc;
      
  
  
      await team.save();

      for (const image of images) {
        await unlinkFile(image.path);
      };

      res.status(200).json({message: 'team updated successfully', updatedteam: team})
  
  
  
  
    } catch (error) {
      res.status(500).json({ errorMessage: 'Error updating team' , error: error});
    }
  })  


export {router as teamRouter}