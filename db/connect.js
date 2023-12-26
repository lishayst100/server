import mongoose from "mongoose";


export const connect = async () =>{
    mongoose.set("strictQuery", false)
   await mongoose.connect('mongodb+srv://lishayst100:nN5hLVUYO2eH0pYf@lishayshemtov.acqphwa.mongodb.net/sequence')
    console.log(`Connected to DataBase`);

}

'mongodb+srv://lishayst100:nN5hLVUYO2eH0pYf@lishayshemtov.acqphwa.mongodb.net/'