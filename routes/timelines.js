const express = require("express");
const app = express();
const router = express.Router();
const multer = require("multer");

const User = require("../models/User");
const Timelines = require("../models/Timelines");
const fetchuser = require("../middleware/fetchuser");
const fs = require("fs");

router.get("/gettimeline/", fetchuser, async (req, res) => {
  try {
    const data = await Timelines.find();
    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});
router.post("/addtimeline/", fetchuser, async (req, res) => {
  try {
    const { timelineName, shortDesc, photoThumbnails, coordinates } = req.body;
    // Destructure properties from req.body
    // Create a new Data instance with individual properties
    const newData = new Timelines({
      timelineName: timelineName,
      shortDesc: shortDesc,
      photoThumbnails: photoThumbnails,
      coordinates: coordinates,
    });

    // Save the new data to the database
    await newData.save();
    const data = await Timelines.find();

    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration for handling file uploads
const upload = multer({
  dest: "uploads/", // Destination directory for uploaded files
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB file size limit (in bytes)
  },
});

router.post("/upload", upload.array("photos", 10), (req, res) => {
  const files = req.files;
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        file.path,
        { folder: "uploaded-images" },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            // Delete the file from the server after successful upload
            fs.unlink(file.path, (unlinkError) => {
              if (unlinkError) {
                console.error("Error deleting file:", unlinkError);
              }
            });
            resolve(result.secure_url);
          }
        }
      );
    });
  });

  Promise.all(uploadPromises)
    .then((uploadedUrls) => {
      // Send an array of uploaded URLs back to the client
      res.json({ success: true, filenames: uploadedUrls }); // Modify to match frontend expectations
    })
    .catch((error) => {
      console.error("Error uploading images to Cloudinary:", error);
      res.status(500).json({
        success: false,
        error: "Error uploading images to Cloudinary",
      });
    });
});

module.exports = router;
