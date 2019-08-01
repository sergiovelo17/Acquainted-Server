const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const eventsSchema = new Schema({
owner: { type: Schema.Types.ObjectId, ref: "User" },
attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
location: { type: Schema.Types.ObjectId, ref: "Places" },
description: String,
time: String,
photoOfEvent: String,
})

const Events = mongoose.model("Events", eventsSchema);
module.exports = Events;
