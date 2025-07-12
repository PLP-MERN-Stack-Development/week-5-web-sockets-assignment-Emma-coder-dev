const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  username: String,
  room: String,
  message: String,
  timestamp: Date,
  reactions: { type: Map, of: Number, default: {} }
});

module.exports = mongoose.model("Message", schema);
