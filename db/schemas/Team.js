import { Schema, model } from "mongoose";

const TeamSchema = new Schema({
    name: String,
    title: String,
    desc: String,
    img: [String],
    linkId: String
})


export const Team = model('Team', TeamSchema)