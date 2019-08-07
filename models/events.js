const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const eventsSchema = new Schema({
owner: { type: Schema.Types.ObjectId, ref: "User" },
attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
location: { type: Schema.Types.ObjectId, ref: "Places" },
description: String,
time: Date,
photoOfEvent: String,
title: String,
discussion: {type: Schema.Types.ObjectId, ref: "Messages" }
})

const Events = mongoose.model("Events", eventsSchema);
module.exports = Events;
