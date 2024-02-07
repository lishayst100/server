import express from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from "morgan";
import {connect} from './db/connect.js'
import {projectRouter} from "./routes/project.js";
import { mailRouter } from "./routes/mail.js";
import { carouselRouter } from "./routes/carousel.js";
import { teamRouter } from "./routes/team.js";
import { textRouter } from "./routes/text.js";


const app = express()
connect().catch(e => console.log(e))


//middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'))
dotenv.config()

app.get('/', (req, res) =>{
    res.json({message: 'Home page'})
})
app.use('/api/projects', projectRouter)
app.use('/api/mail', mailRouter)
app.use('/api/carousel', carouselRouter)
app.use('/api/team', teamRouter)
app.use('/api/text', textRouter)

const PORT = 3001 


app.listen(PORT,()=> {
    console.log(`Server Run On Port ${PORT}`)
})