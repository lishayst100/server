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
  const { title, credits, linkId, genres, isLooping } = req.body;
  const images = req.files['images'];
  const videoFiles = req.files['video'];
  const supplementaryVideos = req.files['supplementaryVideos'];
  const frontImage = req.files['frontImage'];
  const frontImages = req.files['frontImages'];

  try {
    const uploadedImageURLs = [];
    const imagesId = [];
    const uploadedSupplementaryVideoURLs = [];
    const supplementaryVideoIds = [];
    const frontImagesUrls = []

    console.log("frontImages: ", frontImages); // Debugging

    if (images) {
      for (const image of images) {
        const fileBuffer = await fsPromises.readFile(image.path);
        console.log("File Buffer Read: ", fileBuffer); // Debugging
        const result = await imagekit.upload({
          fileName: image.originalname,
          isPrivateFile: false,
          file: fileBuffer,
        });
        console.log("ImageKit Upload Result: ", result); // Debugging
        uploadedImageURLs.push(result.url);
        imagesId.push(result.fileId);
      }
    }

    if (frontImages) {
      for (const image of frontImages) {
        try {
          const fileBuffer = await fsPromises.readFile(image.path);
          console.log("File Buffer Read for Front Image: ", fileBuffer); // Debugging
          const result = await imagekit.upload({
            fileName: image.originalname,
            isPrivateFile: false,
            file: fileBuffer,
          });
          console.log("ImageKit Upload Result for Front Image: ", result); // Debugging
          frontImagesUrls.push(result.url);
        } catch (error) {
          console.error("Error uploading front image: ", error);
        }
      }
    }

    let mainVideoURL = null;
    let mainVideoId = null;
    if (videoFiles && videoFiles.length > 0) {
      const videoFile = videoFiles[0];
      const upload = await cloudinary.uploader.upload(videoFile.path, { resource_type: 'video' });
      mainVideoURL = upload.secure_url;
      mainVideoId = upload.public_id;  // Assuming public_id as video ID
    }

    let mainFrontImageUrl = null;
    let mainFrontImageId = null;
    if (frontImage && frontImage.length > 0) {
      const masterImage = frontImage[0];
      const fileBuffer = await fsPromises.readFile(masterImage.path);
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: masterImage.originalname,
        useUniqueFileName: false,
      });
      mainFrontImageUrl = response.url;
      mainFrontImageId = response.fileId;
    }

    if (supplementaryVideos) {
      for (const videoFile of supplementaryVideos) {
        const upload = await cloudinary.uploader.upload(videoFile.path, { resource_type: 'video' });
        uploadedSupplementaryVideoURLs.push(upload.secure_url);
      }
    }
    console.log(frontImagesUrls); // Debugging

    const newProject = new Project({
      credits,
      link: mainVideoURL,
      linkId,
      title,
      images: uploadedImageURLs,
      genres,
      frontImage: mainFrontImageUrl,
      imagesId: imagesId,
      videoIds: mainVideoId,
      supplementaryVideos: uploadedSupplementaryVideoURLs,
      supplementaryVideoIds: supplementaryVideoIds,
      frontImages: frontImagesUrls,
      isLooping: isLooping // Convert string to boolean if needed
    });

    await newProject.save();

    // Delete uploaded files after saving project
    const deleteFiles = [];
    if (images) {
      for (const image of images) {
        deleteFiles.push(unlinkFile(image.path));
      }
    }
    if (videoFiles && videoFiles.length > 0) {
      deleteFiles.push(unlinkFile(videoFiles[0].path));
    }
    if (frontImage && frontImage.length > 0) {
      deleteFiles.push(unlinkFile(frontImage[0].path));
    }
    if (supplementaryVideos) {
      for (const videoFile of supplementaryVideos) {
        deleteFiles.push(unlinkFile(videoFile.path));
      }
    }
    if (frontImages) {
      for (const front of frontImages) {
        deleteFiles.push(unlinkFile(front.path));
      }
    }
    await Promise.all(deleteFiles);

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
  const { title, credits, link, linkId, urlImages, genres, urlVideos, frontImagesVideosUrl, isLooping } = req.body;
  const images = req.files ? req.files['images'] : undefined;
  const videoFile = req.files ? req.files['video'] : undefined;
  const videoFiles = req.files ? req.files['supplementaryVideos'] : undefined;
  const frontImageFile = req.files ? req.files['frontImage'] : undefined;
  const frontImages = req.files ? req.files['frontImages'] : undefined;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const uploadedImageURLs = [];
    const uploadedFrontImagesURLs = [];
    const uploadedVideosURLs = [];

    if (images) {
      for (const image of images) {
        if (image.path) {
          try {
            const fileBuffer = await fsPromises.readFile(image.path);
            const result = await imagekit.upload({ fileName: image.path, isPrivateFile: false, file: fileBuffer });
            uploadedImageURLs.push(result.url);
          } catch (error) {
            console.error("Error uploading image:", error);
            return res.status(500).json({ errorMessage: "Error uploading image", error: error });
          }
        }
      }
    }
    if (frontImages) {
      for (const image of frontImages) {
        if (image.path) {
          try {
            const fileBuffer = await fsPromises.readFile(image.path);
            const result = await imagekit.upload({ fileName: image.path, isPrivateFile: false, file: fileBuffer });
            uploadedFrontImagesURLs.push(result.url);
          } catch (error) {
            console.error("Error uploading image:", error);
            return res.status(500).json({ errorMessage: "Error uploading image", error: error });
          }
        }
      }
    }

    let mainFrontImageUrl = null;
    if (frontImageFile && frontImageFile.length > 0 && frontImageFile[0].path) {
      try {
        const masterImage = frontImageFile[0];
        const fileBuffer = await fsPromises.readFile(masterImage.path);
        const response = await imagekit.upload({
          file: fileBuffer,
          fileName: masterImage.originalname,
          useUniqueFileName: false,
        });
        mainFrontImageUrl = response.url;
      } catch (error) {
        console.error("Error uploading front image:", error);
        return res.status(500).json({ errorMessage: "Error uploading front image", error: error });
      }
    }

    if (videoFiles) {
      for (const video of videoFiles) {
        if (video.path) {
          try {
            const upload = await cloudinary.uploader.upload(video.path, { resource_type: 'video' });
            uploadedVideosURLs.push(upload.secure_url);
          } catch (error) {
            console.error("Error uploading supplementary video:", error);
            return res.status(500).json({ errorMessage: "Error uploading supplementary video", error: error });
          }
        }
      }
    }

    if (typeof urlImages === "string") {
      uploadedImageURLs.push(urlImages);
    } else if (Array.isArray(urlImages)) {
      uploadedImageURLs.push(...urlImages);
    }
    if (typeof frontImagesVideosUrl === "string") {
      uploadedFrontImagesURLs.push(frontImagesVideosUrl);
    } else if (Array.isArray(frontImagesVideosUrl)) {
      uploadedFrontImagesURLs.push(...frontImagesVideosUrl);
    }

    if (typeof urlVideos === "string") {
      uploadedVideosURLs.push(urlVideos);
    } else if (Array.isArray(urlVideos)) {
      uploadedVideosURLs.push(...urlVideos);
    }

    let mainVideoURL = null;
    if (videoFile && videoFile.length > 0 && videoFile[0].path) {
      try {
        const video = videoFile[0];
        const upload = await cloudinary.uploader.upload(video.path, { resource_type: 'video' });
        mainVideoURL = upload.secure_url;
      } catch (error) {
        console.error("Error uploading main video:", error);
        return res.status(500).json({ errorMessage: "Error uploading main video", error: error });
      }
    }

    project.images = uploadedImageURLs;
    project.supplementaryVideos = uploadedVideosURLs;
    project.title = title || project.title;
    project.credits = credits || project.credits;
    project.link = mainVideoURL === null ? project.link : mainVideoURL;
    project.linkId = linkId || project.linkId;
    project.genres = genres || project.genres;
    project.frontImage = mainFrontImageUrl || project.frontImage;
    project.frontImages = uploadedFrontImagesURLs || project.frontImages;
    project.isLooping = isLooping !== undefined ? isLooping : project.isLooping; // Update isLooping field

    await project.save();

    const unlinkPromises = [];

    if (images) {
      for (const image of images) {
        if (image.path) {
          unlinkPromises.push(unlinkFile(image.path));
        }
      }
    }
    if (videoFiles) {
      for (const video of videoFiles) {
        if (video.path) {
          unlinkPromises.push(unlinkFile(video.path));
        }
      }
    }
    if (videoFile && videoFile[0].path) {
      unlinkPromises.push(unlinkFile(videoFile[0].path));
    }
    if (frontImageFile && frontImageFile[0].path) {
      unlinkPromises.push(unlinkFile(frontImageFile[0].path));
    }
    if (frontImages && frontImages[0].path) {
      unlinkPromises.push(unlinkFile(frontImages[0].path));
    }

    await Promise.all(unlinkPromises);

    res.status(200).json({
      message: "Project updated successfully",
      updatedProject: project,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ errorMessage: "Error updating project", error: error });
  }
};
