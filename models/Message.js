const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    senderId: String,
    receiverId: String,
    message: String,
    createdAt: { type: Date, default: Date.now },

    // NEW fields → old messages will simply ignore them
    isDelivered: { type: Boolean, default: true },
    isRead: { type: Boolean, default: false },
    deletedFor: {
        type: [String],
        default: []   // IMPORTANT so old messages work
    },
    deletedForEveryone: { type: Boolean, default: false }
});


module.exports = mongoose.model("Message", messageSchema);
