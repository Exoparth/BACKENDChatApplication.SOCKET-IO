const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
    try {
        const { userId, message } = req.body;

        if (!userId || !message) {
            return res.status(400).json({ error: "userId & message required" });
        }

        const newMessage = await Message.create({
            userId,
            message,
        });

        return res.json({
            success: true,
            message: "Message sent",
            data: newMessage,
        });
    } catch (error) {
        console.log("Message Send Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: 1 }); // oldest first
        res.json({ success: true, messages });
    } catch (error) {
        console.log("Get Messages Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.sendPrivateMessage = async (req, res) => {
    try {
        const { senderId, receiverId, message, senderName } = req.body;

        const msg = await Message.create({
            senderId,
            receiverId,
            message,
            senderName,
        });

        res.json({ success: true, msg });
    } catch (err) {
        res.json({ error: err });
    }
};


exports.getConversation = async (req, res) => {
    try {
        const { user1, user2 } = req.params;

        const msgs = await Message.find({
            $or: [
                { senderId: user1, receiverId: user2 },
                { senderId: user2, receiverId: user1 }
            ]
        }).sort({ createdAt: 1 });

        res.json({ success: true, msgs });
    } catch (err) {
        res.json({ error: err });
    }
};
