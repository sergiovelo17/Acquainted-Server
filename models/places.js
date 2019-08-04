const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const placesSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  name: String,
  placeId: String,
  lat: Number,
  lng: Number,
  photos: [Object],
  price_level: Number,
  rating: Number,
  types: [String],
  phone: String,
  address: String,
  website: String,
  hours: [String],
  icon: String,
  reviews: [Object]
})

const Places = mongoose.model("Places", placesSchema);
module.exports = Places;
