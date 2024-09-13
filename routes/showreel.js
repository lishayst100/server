import { Router } from "express";
import { addShowreel, getShowreel, updateShowreel } from "../controllers/showreel.js";
import multer from "multer";
import { Showreel } from "../db/schemas/Showreel.js";

const router = Router()


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'tmp/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now();
      cb(null, uniqueSuffix + file.originalname);
    },
  });
  
  const upload = multer({
    storage: storage,
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(mp4)$/)) {
        return cb(new Error('Error upload file'));
      }
      cb(undefined, true);
    },
  });


  const uploadField = [
    { name: 'video', maxCount: 1 }, // For the video
  ];


router.post('/addShowreel' , upload.fields(uploadField) , addShowreel)
router.get('/getShowreel' , getShowreel)
router.put('/updateShowreel/:showreelId' ,upload.fields(uploadField), updateShowreel)
router.get('/getShowreel/:id', function(req, res){
    Showreel.findById(req.params.id)
    .then(result => res.json(result))
    .catch(e => console.log(e))
  })


export {router as showreelRouter};


