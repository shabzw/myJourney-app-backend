const express = require("express");
const app = express();
const router = express.Router();
const multer = require("multer");

// const User = require("../models/User");
const Timelines = require("../models/Timelines");
const Events = require("../models/Events");
const fetchuser = require("../middleware/fetchuser");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/addevent/", fetchuser, async (req, res) => {
  try {
    const { timelineId, eventName, para1, para2, period, photos } = req.body;
    // Destructure properties from req.body
    const newData = new Events({
      timelineId: timelineId,
      eventName: eventName,
      para1: para1,
      para2: para2,
      period: period,
      photos: photos,
    });

    // Save the new data to the database
    await newData.save();
    const data = await Events.find({ timelineId: timelineId });

    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});

router.get("/getevents/", fetchuser, async (req, res) => {
  try {
    const id = req.header("timelineId");
    const data = await Events.find({ timelineId: id });
    const dataB = await Timelines.findById(id);
    res.json({ data, dataB });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});

const upload = multer({
  dest: "uploads/", // Destination directory for uploaded files
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB file size limit (in bytes)
  },
});

// Route for handling file uploads
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
