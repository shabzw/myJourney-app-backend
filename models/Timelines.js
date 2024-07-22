const mongoose = require("mongoose");
const { Schema } = mongoose;

const timelineSchema = new Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
  timelineName: { type: String, required: true },
  shortDesc: { type: String, required: true },
  // photoThumbnails: [{ type: String, required: true }],
  photoThumbnails: [{ type: String }],
  coordinates: {type: String, required: true},
  currentIndex: {type: Number},
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Events" }], // Reference to the Events model
  lastUpdated: { type: Date, default: Date.now },
});

const TimelinesModel = mongoose.model("Timelines", timelineSchema);

module.exports = TimelinesModel;
