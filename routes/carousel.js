import { Router } from "express";
import cloudinary from "../cloudinary/config.js";
import { Carousel } from "../db/schemas/Carousel.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "tmp/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileField: "images",
  limits: {
    fileSize: 100000000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg)$/)) {
      return cb(new Error("Error upload file"));
    }
    cb(undefined, true);
  },
});



router.get('/', function(req, res){
    Carousel.find({})
    .then(result => res.json(result))
    .catch(e => console.log(e))
})


router.get('/findCarousel/:id', function(req, res){
    Carousel.findById(req.params.id)
    .then(result => res.json(result))
    .catch(e => console.log(e))
})

router.post(
  "/addCarouselImage",
  upload.array("carouselImages"),
  async (req, res) => {
    const images = req.files;

    try {
      const uploadedImageURLs = [];
      for (const image of images) {
        const result = await cloudinary.uploader.upload(image.path);
        uploadedImageURLs.push(result.secure_url);
      }

      const newProject = new Carousel({
        url: uploadedImageURLs,
      });

      await newProject.save();

      res
        .status(200)
        .json({ message: "Carousel created successfully", newProject });
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Error creating project" });
    }
  }
);


router.put('/updateImages/:id', upload.array("carouselImages"), async (req,res) => {
  const { id } = req.params;
  const { urlImages} = req.body;
  const images = req.files;
  


  try {
    const carousel = await Carousel.findById(id)
    if(!carousel){
      return res.status(404).json({message: 'carousel not found'})
    }

    const uploadedImageURLs = [];

    
    for (const image of images) {
      const result = await cloudinary.uploader.upload(image.path);
      uploadedImageURLs.push(result.secure_url);
    }


    if (typeof urlImages === 'string') {
      uploadedImageURLs.push(urlImages);
    } else if (Array.isArray(urlImages)) {
      uploadedImageURLs.push(...urlImages);
    }

    

    carousel.url = uploadedImageURLs;
    


    await carousel.save();
    res.status(200).json({message: 'carousel updated successfully', updatedcarousel: carousel})




  } catch (error) {
    res.status(500).json({ errorMessage: 'Error updating carousel' , error: error});
  }
} )




export {router as carouselRouter}