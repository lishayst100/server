import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "tmp/");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now();
      cb(null, uniqueSuffix + file.originalname);
    },
  });
  
 export const upload = multer({
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