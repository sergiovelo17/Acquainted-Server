const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const placesSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  name: String,
  placeId: String,
  lat: Number,
  lng: Number,
  photos: [String],
  price_level: Number,
  rating: Number,
  type: [String],
  reviewsCount: Number,
  vicinity: String
})

const Places = mongoose.model("Places", placesSchema);
module.exports = Places;
