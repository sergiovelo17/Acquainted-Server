const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    username: {
      type: String,
      unique: true,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    profileImg: {
      type: String,
      default: "/images/userdefault.png"
    },
    profileDescription: {type: String, default: "No description yet..."},
    acquaintedCity: {type: String, required: true},
    isAcquaintance: {type: Boolean, default: false},
    upcomingEvents: [{ type: Schema.Types.ObjectId, ref: "Events" }],
    pastEvents: [{ type: Schema.Types.ObjectId, ref: "Events" }],
    favoritePlaces: [{ type: Schema.Types.ObjectId, ref: "Places" }],
    chats: [{ type: Schema.Types.ObjectId, ref: "Chats" }]
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
