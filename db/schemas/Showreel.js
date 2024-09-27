import { Schema, model } from "mongoose";

const ShowreelSchema = new Schema({
    link: String,
})


export const Showreel = model('Showreel', ShowreelSchema)