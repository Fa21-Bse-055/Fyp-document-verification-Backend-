const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: String, // 'student' or 'organization'
    content: String,
    timestamp: { type: Date, default: Date.now }
  });

const chatSchema = new mongoose.Schema({
    studentEmail: String,
    messages: [messageSchema]
  });
  
module.exports = mongoose.model("Chat", chatSchema);
  