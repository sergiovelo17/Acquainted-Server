const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const messageSchema = new Schema({
  createdBy: {
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  body: String,
  createdAt: {
    type: Date,
    default: Date.now()
  }
})

const Messages = mongoose.model("Messages", messageSchema);
module.exports = Messages;
