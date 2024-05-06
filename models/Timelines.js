const mongoose = require("mongoose");
const { Schema } = mongoose;

const timelineSchema = new Schema({
  timelineName: { type: String, required: true },
  shortDesc: { type: String, required: true },
  photo: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

const TimelinesModel = mongoose.model("Timelines", timelineSchema);

module.exports = TimelinesModel;
