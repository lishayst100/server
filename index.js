import express from "express";
import cors from 'cors';
import morgan from "morgan";
import {connect} from './db/connect.js'
import {projectRouter} from "./routes/project.js";
import multer from "multer";
import { Project } from "./db/schemas/Project.js";


const app = express()
connect().catch(e => console.log(e))

//middlewares
app.use(cors({ origin: 'https://seq-frontend-managment.vercel.app' }));
app.use(express.json());
app.use(morgan('dev'))












app.use('/api/projects', projectRouter)
const PORT = 3001 


app.listen(PORT,()=> {
    console.log(`Server Run On Port ${PORT}`)
})