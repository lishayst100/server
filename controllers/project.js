import { Project } from "../db/schemas/Project.js";
import cloudinary from "../cloudinary/config.js";
import util from "util";
import fs from "fs";
import { imagekit } from "../cloudinary/imageKit.js";
import fsPromises from 'fs/promises'

const unlinkFile = util.promisify(fs.unlink);

export const getProjects = (req, res) => {
  Project.find({})
    .then((result) => res.json(result))
    .catch((e) => console.log(e));
};

export const addProject = async (req, res) => {
  const { title, credits, linkId, genres } = req.body;
  const images = req.files['images'];
  const videoFiles = req.files['video'];
  const supplementaryVideos = req.files['supplementaryVideos'];
  console.log(supplementaryVideos)

  try {
    const uploadedImageURLs = [];
    const imagesId = [];
    const uploadedSupplementaryVideoURLs = [];
    const supplementaryVideoIds = [];

    if (images) {
      for (const image of images) {
        const fileBuffer = await fsPromises.readFile(image.path);
        const result = await imagekit.upload({ fileName: image.path, isPrivateFile: false ,file:fileBuffer });
        uploadedImageURLs.push(result.url);
        imagesId.push(result.fileId);
      }
    }

    let mainVideoURL = null;
    let mainVideoId = null;
    if (videoFiles) {
      const videoFile = videoFiles[0];
      const fileBuffer = await fsPromises.readFile(videoFile.path);
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: videoFile.originalname,
        useUniqueFileName: false,
      });
      mainVideoURL = response.url;
      mainVideoId = response.fileId;
    }

    if (supplementaryVideos) {
      for (const videoFile of supplementaryVideos) {
        const fileBuffer = await fsPromises.readFile(videoFile.path);
        const result = await imagekit.upload({
          file: fileBuffer,
          fileName: videoFile.originalname,
          useUniqueFileName: false,
        });
        uploadedSupplementaryVideoURLs.push(result.url);
        supplementaryVideoIds.push(result.fileId);
      }
    }

    const newProject = new Project({
      credits,
      link: mainVideoURL,
      linkId,
      title,
      images: uploadedImageURLs,
      genres,
      frontImage: uploadedImageURLs[0],
      imagesId: imagesId,
      videoIds: mainVideoId,  // Main video file ID
      supplementaryVideos: uploadedSupplementaryVideoURLs,  // Additional video URLs
      supplementaryVideoIds: supplementaryVideoIds  // Additional video file IDs
    });

    await newProject.save();

    // Delete uploaded files after saving project
    if (images) {
      for (const image of images) {
        await unlinkFile(image.path);
      }
    }
    if (videoFiles) {
      await unlinkFile(videoFiles[0].path);
    }
    if (supplementaryVideos) {
      for (const videoFile of supplementaryVideos) {
        await unlinkFile(videoFile.path);
      }
    }

    res.status(201).json({ message: "Project created successfully", newProject });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Error creating project" });
  }
};


export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Delete images from Cloudinary
    /* for (const imageUrl of project.images) {
      const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract public ID from Cloudinary URL
      await cloudinary.uploader.destroy(publicId);
    } */
    for (const imageUrl of project.imagesId) {
      imagekit.deleteFile(imageUrl, function(error, result) {
        if(error) console.log(error);
        else console.log(result);
    })
    }

    // Delete project from MongoDB
    await Project.findByIdAndDelete(req.params.projectId);

    res.status(200).json({ message: "Project and associated images deleted" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Error deleting project and images" });
  }
};

export const findProjectByGenre = async (req, res) => {
  try {
    if (req.params.genre === "all") {
      const project = await Project.find({});
      return res.status(200).json(project);
    }
    const project = await Project.find({ genres: { $in: [req.params.genre] } });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error("Error finding project by genre:", error);
    res.status(500).json({ error: "Error finding project by genre" });
  }
};

export const updateProject = async (req, res) => {
  const result = await Project.updateOne(
    { _id: req.params.id },
    { $set: req.body }
  );
  res.send(result);
};

export const getOneProject = (req, res) => {
  Project.findById(req.params.id)
    .then((result) => res.json(result))
    .catch((e) => console.log(e));
};

//get the data from the client
//find the project by id check if it exists if it does not then return 404
//get the uploded images and save them to cloudinary
//add the uploded images to array of url's images
//update the project in the DB

export const myUpdateProject = async (req, res) => {
  const { projectId } = req.params;
  const { title, credits, link, linkId, urlImages, genres, frontImage,urlVideos } =
    req.body;
  const images = req.files['images'];
  const videoFile = req.files['video'];
  const videoFiles = req.files['supplementaryVideos'];
  console.log(urlImages)

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const uploadedImageURLs = [];
    const uploadedVideosURLs = [];
    if (images) {
      for (const image of images) {
        const fileBuffer = await fsPromises.readFile(image.path);
        const result = await imagekit.upload({ fileName: image.path, isPrivateFile: false, file: fileBuffer });
        uploadedImageURLs.push(result.url);
      }
    }

    if (videoFiles) {
      for (const video of videoFiles) {
        const fileBuffer = await fsPromises.readFile(video.path);
        const result = await imagekit.upload({ fileName: video.path, isPrivateFile: false, file: fileBuffer });
        uploadedVideosURLs.push(result.url);
      }
    }

    if (typeof urlImages === "string") {
      uploadedImageURLs.push(urlImages);
    } else if (Array.isArray(urlImages)) {
      uploadedImageURLs.push(...urlImages);
    }

    if (typeof urlVideos === "string") {
      uploadedVideosURLs.push(urlVideos);
    } else if (Array.isArray(urlVideos)) {
      uploadedVideosURLs.push(...urlVideos);
    }

    let videoURL = null;
    if (videoFile) {
      const video = videoFile[0];
      const fileBuffer = await fsPromises.readFile(video.path);
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: video.originalname,
        useUniqueFileName: false,
      });
      videoURL = response.url;
    }

    project.images = uploadedImageURLs;
    project.supplementaryVideos = uploadedVideosURLs;
    project.title = title || project.title;
    project.credits = credits || project.credits;
    project.link = videoURL === null ? project.link : videoURL;
    project.linkId = linkId || project.linkId;
    project.genres = genres || project.genres;
    project.frontImage = frontImage || project.frontImage;

    await project.save();

    if (images) {
      for (const image of images) {
        await unlinkFile(image.path);
      }
    }
    if (videoFiles) {
      for (const image of videoFiles) {
        await unlinkFile(image.path);
      }
    }
    if (videoFile) {
      await unlinkFile(videoFile[0].path);
    }

    res.status(200).json({
      message: "Project updated successfully",
      updatedProject: project,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ errorMessage: "Error updating project", error: error });
  }
};
