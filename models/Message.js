const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    senderId: String,      // who sent
    receiverId: String,    // who received
    message: String,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
