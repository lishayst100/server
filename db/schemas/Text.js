import { Schema, model } from "mongoose";

export const TextAboutSchema = new Schema({
    text: String
})


export const TextAbout = model('about-text', TextAboutSchema)