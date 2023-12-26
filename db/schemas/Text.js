import mongoose from "mongoose";

const textSchema = new mongoose.Schema({
    text : String
});

export default mongoose.models.text || mongoose.model('text', textSchema)