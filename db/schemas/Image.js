import { Schema, model } from "mongoose";

const ImageSchema = new Schema({
    image:String
})


export const ImageModel = model('Images', ImageSchema)