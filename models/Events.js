const mongoose = require("mongoose");
const { Schema } = mongoose;

const eventsSchema = new Schema({
  timelineId: { type: mongoose.Schema.Types.ObjectId, ref: "Timelines" },
  eventName: { type: String, required: true },
  para1: { type: String, required: true },
  para2: { type: String, required: true },
  photos: [{ type: String, required: true }],
  period: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

const EventsModel = mongoose.model("Events", eventsSchema);

module.exports = EventsModel;
