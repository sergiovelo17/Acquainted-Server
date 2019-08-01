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
    hostedEvents: [{ type: Schema.Types.ObjectId, ref: "Events" }],
    isAcquaintance: {type: Boolean, required: true, default: false},
    upcomingEvents: [{ type: Schema.Types.ObjectId, ref: "Events" }],
    pastEvents: [{ type: Schema.Types.ObjectId, ref: "Events" }],
    favoritePlaces: [{ type: Schema.Types.ObjectId, ref: "Places" }],
    chats: [{ type: Schema.Types.ObjectId, ref: "Chats" }],
    cityPlaces: {
      restaurants: {
        nextPage: String,
        results: [{type: Object}]
      },
      banks: {
        nextPage: String,
        results: [{type: Object}]
      },
      lodging: {
        nextPage: String,
        results: [{type: Object}]
      },
      doctors: {
        nextPage: String,
        results: [{type: Object}]
      },
      leisure: {
        nextPage: String,
        results: [{type: Object}]
      },
      bars: {
        nextPage: String,
        results: [{type: Object}]
      },
      government: {
        nextPage: String,
        results: [{type: Object}]
      },
      shopping: {
        nextPage: String,
        results: [{type: Object}]
      },
      gym:{
        nextPage: String,
        results: [{type: Object}]
      }
  },
},
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
