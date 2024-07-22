const express = require("express");
const app = express();
const router = express.Router();
const multer = require("multer");

// const User = require("../models/User");
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

router.get("/getmytimeline/", fetchuser, async (req, res) => {
  try {
    const data = await Timelines.find({ userId: req.user.id });
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
      userId: req.user.id,
      timelineName: timelineName,
      shortDesc: shortDesc,
      photoThumbnails: photoThumbnails,
      coordinates: coordinates,
    });

    // Save the new data to the database
    await newData.save();
    const data = await Timelines.find({ userId: req.user.id });

    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});

router.put("/edittimeline/", fetchuser, async (req, res) => {
  try {
    const {
      timelineNameE,
      shortDescE,
      coordinatesE,
      timelineIdE,
      photoThumbnailsE,
    } = req.body; // Destructure properties from req.body
    const dataEdit = await Timelines.findById(timelineIdE);
    dataEdit.set({
      timelineName: timelineNameE,
      shortDesc: shortDescE,
      coordinates: coordinatesE,
      photoThumbnails: photoThumbnailsE,
    });

    await dataEdit.save();
    // const data = await Events.find({idNumber : studentId})
    const updatedTimelines = await Timelines.find({ userId: req.user.id });
    console.log(updatedTimelines);
    res.json(updatedTimelines);
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

router.delete("/deletetimeline/", fetchuser, async (req, res) => {
  const { timelineId } = req.body; // Extract the document ID from the request parameters
  try {
    // Check if the document with the specified ID exists
    const existingData = await Timelines.findOne({ _id: timelineId });

    if (!existingData) {
      return res.status(404).json({ message: "Data not found" });
    }
    // Update the collection by deleting the document with the specified ID
    await Timelines.deleteOne({ _id: timelineId });

    const data = await Timelines.find({ userId: req.user.id });

    res.json(data);
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ message: "Internal Server Error occurred" });
  }
});

module.exports = router;
