import mongoose from "mongoose";


const projectSchema = new mongoose.Schema({
    link: String,
    title: String,
    images: [String],
    credits: String,
    linkId:String,
    genres: [String],
    frontImage: String,
    imagesId: [String],
    supplementaryVideos:[String],
    supplementaryVideosIds:[String],
  });
  
  export const Project = mongoose.model('Project', projectSchema);
  

  