const express = require("express");
const app = express();
const router = express.Router();
const multer = require("multer");

const Timelines = require("../models/Timelines");
const Events = require("../models/Events");
const fetchuser = require("../middleware/fetchuser");
const fs = require("fs");
const { default: mongoose } = require("mongoose");
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
      ownerId: req.user.id,
      timelineId: timelineId,
      eventName: eventName,
      para1: para1,
      para2: para2,
      period: period,
      photos: photos,
    });

    // Save the new data to the database
    await newData.save();
    const objId = new mongoose.Types.ObjectId(newData.id);
    const pushData = await Timelines.updateOne(
      { _id: timelineId },
      { $push: { events: objId } },
      { upsert: false, new: true }
    );
    const data = await Events.find({ timelineId: timelineId });
    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});

router.put("/editevent/", fetchuser, async (req, res) => {
  try {
    const {
      eventNameE,
      para1E,
      para2E,
      periodE,
      eventId,
      timelineId,
      photosE,
    } = req.body; // Destructure properties from req.body
    const dataEdit = await Events.findById(eventId);
    dataEdit.set({
      eventName: eventNameE,
      para1: para1E,
      para2: para2E,
      period: periodE,
      photos: photosE,
    });

    await dataEdit.save();
    // const data = await Events.find({idNumber : studentId})
    const updatedEvents = await Events.find({ timelineId: timelineId });
    res.json(updatedEvents);
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
router.get("/getEdata/", fetchuser, async (req, res) => {
  try {
    const timelines = await Timelines.find().populate("events").exec();
    // Send all populated events data as a response
    res.json(timelines);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occurred");
  }
});

router.get("/getsingleevent/", fetchuser, async (req, res) => {
  try {
    const eventId = req.headers["eventid"];

    const data = await Events.findById(eventId);
    // Send all populated events data as a response
    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occurred");
  }
});

const upload = multer({
  dest: "uploads/", // Destination directory for uploaded files
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB file size limit (in bytes)
  },
});

router.post("/uploadsingle/", upload.single("photo"), async (req, res) => {
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

router.get("/gettimelineevent/", fetchuser, async (req, res) => {
  try {
    const eventId = req.headers["eventid"];
    const timelineId = req.headers["timelineid"];
    const timelineEvent = await Timelines.findById(eventId)
      .populate({
        path: "events",
        match: { _id: timelineId },
      })
      .exec();
    // Send all populated events data as a response
    res.json(timelineEvent);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occurred");
  }
});

router.put("/updateevents/", fetchuser, async (req, res) => {
  try {
    const {
      date,
      place,
      source,
      intro,
      keyComponents,
      headings,
      images,
      paragraphs,
    } = req.body; // Destructure properties from req.body
    const id = req.header("eventId");

    const dataEdit = await Events.findById(id);
    dataEdit.set({
      date,
      place,
      source,
      intro,
      keyComponents,
      headings,
      images,
      paragraphs,
    });

    await dataEdit.save();
    // const data = await Events.find({idNumber : studentId})

    res.json({ message: "Data updation successfull" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});

router.put("/updateInfo/", fetchuser, async (req, res) => {
  try {
    const { headingE, imageE, paraE } = req.body; // Destructure properties from req.body
    const id = req.header("eventId");

    const dataEdit = await Events.findById(id);
    dataEdit.set({
      headings: headingE,
      images: imageE,
      paragraphs: paraE,
    });

    await dataEdit.save();
    // const data = await Events.find({idNumber : studentId})

    res.json({ message: "Data updation successfull" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});

router.delete("/deleteevent/", fetchuser, async (req, res) => {
  const { delEventId, timelineId } = req.body; // Extract the document ID from the request parameters
  try {
    // Check if the document with the specified ID exists
    const existingData = await Events.findOne({ _id: delEventId });

    if (!existingData) {
      return res.status(404).json({ message: "Data not found" });
    }
    // Update the collection by deleting the document with the specified ID
    await Events.deleteOne({ _id: delEventId });

    const data = await Events.find({ timelineId: timelineId });

    res.json(data);
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ message: "Internal Server Error occurred" });
  }
});

module.exports = router;
