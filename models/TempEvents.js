const mongoose = require("mongoose");
const { Schema } = mongoose;

const tempeventsSchema = new Schema({
//   timelineId: { type: mongoose.Schema.Types.ObjectId, ref: "Timelines" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Events" },
  ownerId: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
  eventName: { type: String, required: true },
//   para1: { type: String, required: true },
//   para2: { type: String, required: true },
//   photos: [{ type: String, required: true }],
//   period: { type: String, required: true },
//   lastUpdated: { type: Date, default: Date.now },
  intro : { type: String},
  date : { type: String},
  place : { type: String},
  source : { type: String},
  keyComponents : { type: String},
  headings : [{ type: String}],
  paragraphs : [{ type: String}],
  images : [{ type: String}],
  status : {
    type: String,
    enum: ['pending', 'approve', 'reject'],
    default: "pending"
    },
});

const TempEventsModel = mongoose.model("TempEvents", tempeventsSchema);

module.exports = TempEventsModel;
