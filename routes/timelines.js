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
    // const studentId = req.header("studentId");
    const data = await Timelines.find();
    console.log(data);
    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});
router.post("/addtimeline/", fetchuser, async (req, res) => {
  try {
    const { timelineName, shortDesc, photo } = req.body;
    // Destructure properties from req.body
    // const studentId = req.header("studentId");
    // Create a new Data instance with individual properties
    const newData = new Timelines({
      timelineName: timelineName,
      shortDesc: shortDesc,
      photo: photo,
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

router.post("/upload/", upload.single("photo"), async (req, res) => {
  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // Delete uploaded image file
    await fs.unlinkSync(req.file.path);

    // Return image URL
    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
