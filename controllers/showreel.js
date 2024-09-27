import cloudinary from "../cloudinary/config.js";
import { Showreel } from "../db/schemas/Showreel.js";
import util from "util";
import fs from "fs";
import { imagekit } from "../cloudinary/imageKit.js";
import fsPromises from 'fs/promises'

const unlinkFile = util.promisify(fs.unlink);


export const addShowreel = async (req, res) => {
  const videoFiles = req.files["video"];
  try {
    let mainVideoURL = null;
    let mainVideoId = null;
    if (videoFiles && videoFiles.length > 0) {
      const videoFile = videoFiles[0];
      const upload = await cloudinary.uploader.upload(videoFile.path, {
        resource_type: "video",
      });
      mainVideoURL = upload.secure_url;
      mainVideoId = upload.public_id; 
    }

    const newShowreel = new Showreel({
      link: mainVideoURL
    });

    await newShowreel.save();

    
    const deleteFiles = [];

    if (videoFiles && videoFiles.length > 0) {
      deleteFiles.push(unlinkFile(videoFiles[0].path));
    }

    await Promise.all(deleteFiles);

    res
      .status(201)
      .json({ message: "Showreel created successfully" });
  } catch (error) {
    console.error("Error creating Showreel:", error);
    res.status(500).json({ error: "Error creating Showreel" });
  }
};


export const getShowreel = (req, res) => {
  Showreel.find({})
    .then((result) => res.json(result))
    .catch((e) => console.log(e));
};



export const updateShowreel = async (req, res) => {
  const { showreelId } = req.params;
  const videoFile = req.files ? req.files['video'] : undefined;


  try {
    const showreel = await Showreel.findById(showreelId);
    if (!showreel) {
      return res.status(404).json({ message: "showreel not found" });
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

   
    showreel.link = mainVideoURL === null ? showreel.link : mainVideoURL;
    

    await showreel.save();

    const unlinkPromises = [];

    if (videoFile && videoFile[0].path) {
      unlinkPromises.push(unlinkFile(videoFile[0].path));
    }

    await Promise.all(unlinkPromises);

    res.status(200).json({
      message: "showreel updated successfully",
      updatedShowreel: showreel,
    });
  } catch (error) {
    console.error("Error updating showreel:", error);
    res.status(500).json({ errorMessage: "Error updating showreel", error: error });
  }
};


export const editShowreel = async (req, res) => {
  const { showreelText } = req.body; 
  const { showreelId } = req.params;

  try {
    const showreel = await Showreel.findById(showreelId);
    if (!showreel) {
      return res.status(404).json({ message: "Showreel not found" });
    }

    // Update the link field if showreelText is not null
    showreel.link = showreelText === null ? showreel.link : showreelText;

    // Save the updated showreel
    await showreel.save();

    res.status(200).json({
      message: "Showreel updated successfully",
      updatedShowreel: showreel,
    });
  } catch (error) {
    console.error("Error updating showreel:", error);
    res.status(500).json({ errorMessage: "Error updating showreel", error: error });
  }
};
