const express = require("express");
const app = express();
const router = express.Router();
const multer = require("multer");

// const User = require("../models/User");
// const Timelines = require("../models/Timelines");
const Events = require("../models/Events");
const TempEvents = require("../models/TempEvents");
const fetchuser = require("../middleware/fetchuser");
const { default: mongoose } = require("mongoose");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/addtempevent/", fetchuser, async (req, res) => {
  let success = false;
  try {
    const {
      eventName,
      eventId,
      ownerId,
      userId,
      date,
      place,
      source,
      intro,
      keyComponents,
      headings,
      images,
      paragraphs,
    } = req.body;
    // Destructure properties from req.body
    const newData = new TempEvents({
      ownerId,
      userId,
      eventId,
      eventName,
      date,
      place,
      source,
      intro,
      keyComponents,
      headings,
      images,
      paragraphs,
    });

    // Save the new data to the database
    await newData.save();
    success = true;
    res.json(success);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});

router.get("/gettempevents/", fetchuser, async (req, res) => {
  try {
    // const userId = req.header("userId");
    const data = await TempEvents.find();
    res.json({ data });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});

router.put("/rejectrequest/", fetchuser, async (req, res) => {
  let success = false;
  try {
    const { eventId, status } = req.body; // Destructure properties from req.body
    const dataEdit = await TempEvents.findById(eventId);
    dataEdit.set({
      status: status,
    });

    await dataEdit.save();
    success = true;
    // const data = await Events.find({idNumber : studentId})
    res.json(success);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});

router.put("/approverequest/", fetchuser, async (req, res) => {
  let success = false;
  try {
    const {
      eventId,
      tempEventId,
      status,
      place,
      date,
      source,
      intro,
      keyComponents,
      headings,
      paragraphs,
      images,
    } = req.body; // Destructure properties from req.body
    const dataEdit = await Events.findById(eventId);
    dataEdit.set({
      place,
      date,
      source,
      intro,
      keyComponents,
      headings,
      paragraphs,
      images,
    });

    await dataEdit.save();

    const dataEdit1 = await TempEvents.findById(tempEventId);
    dataEdit1.set({
      status,
    });

    await dataEdit1.save();

    success = true;
    // const data = await Events.find({idNumber : studentId})
    res.json(success);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});

router.put("/rerequest/", fetchuser, async (req, res) => {
  try {
    const {
      tempEventId,
      status,
      place,
      date,
      intro,
      source,
      keyComponents,
      headings,
      paragraphs,
      images,
    } = req.body; // Destructure properties from req.body
    const dataEdit = await TempEvents.findById(tempEventId);
    dataEdit.set({
      status: status,
      place,
      date,
      intro,
      source,
      keyComponents,
      headings,
      paragraphs,
      images,
    });

    await dataEdit.save();
    // const data = await Events.find({idNumber : studentId})
    const eventsData = await TempEvents.find();
    res.json(eventsData);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});

router.delete("/deleterequest/", fetchuser, async (req, res) => {
  const { requestId } = req.body; // Extract the document ID from the request parameters
  try {
    // Check if the document with the specified ID exists
    const existingData = await TempEvents.findOne({ _id: requestId });

    if (!existingData) {
      return res.status(404).json({ message: "Data not found" });
    }
    // Update the collection by deleting the document with the specified ID
    await TempEvents.deleteOne({ _id: requestId });

    const data = await TempEvents.find();

    res.json(data);
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ message: "Internal Server Error occurred" });
  }
});

module.exports = router;
