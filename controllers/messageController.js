const Message = require("../models/Message");

// Save + return message (used by frontend, then socket emits this)
exports.sendPrivateMessage = async (req, res) => {
    try {
        const { senderId, receiverId, message, senderName } = req.body;

        const msg = await Message.create({
            senderId,
            receiverId,
            message,
            isDelivered: true, // saved in DB = considered delivered
            isRead: false,
        });

        res.json({ success: true, msg });
    } catch (err) {
        console.log("sendPrivateMessage error:", err);
        res.status(500).json({ error: "Could not send message" });
    }
};

// Get conversation between two users
exports.getConversation = async (req, res) => {
    try {
        const { user1, user2 } = req.params;

        const msgs = await Message.find({
            $and: [
                {
                    $or: [
                        { senderId: user1, receiverId: user2 },
                        { senderId: user2, receiverId: user1 }
                    ]
                },
                {
                    $or: [
                        { deletedForEveryone: { $exists: false } },
                        { deletedForEveryone: false }
                    ]
                },
                {
                    deletedFor: { $nin: [user1] }
                }
            ]
        }).sort({ createdAt: 1 });


        res.json({ success: true, msgs });
    } catch (err) {
        console.log("getConversation error: ", err);
        res.status(500).json({ error: "Could not get messages" });
    }
};

// Mark messages from sender → receiver as read
exports.markRead = async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;

        await Message.updateMany(
            {
                senderId,
                receiverId,
                isRead: false,
                deletedForEveryone: { $ne: true },
            },
            { $set: { isRead: true } }
        );

        res.json({ success: true });
    } catch (err) {
        console.log("markRead error:", err);
        res.status(500).json({ error: "Could not mark messages read" });
    }
};

// Unread counts per sender for one user
exports.getUnreadCounts = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await Message.aggregate([
            {
                $match: {
                    receiverId: require("mongoose").Types.ObjectId.createFromHexString(
                        userId
                    ),
                    isRead: false,
                    deletedForEveryone: { $ne: true },
                },
            },
            {
                $group: {
                    _id: "$senderId",
                    count: { $sum: 1 },
                },
            },
        ]);

        const counts = {};
        result.forEach((row) => {
            counts[row._id.toString()] = row.count;
        });

        res.json({ success: true, counts });
    } catch (err) {
        console.log("getUnreadCounts error:", err);
        res.status(500).json({ error: "Could not fetch unread counts" });
    }
};

// Delete message (for me or for everyone)
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId, userId, forEveryone } = req.body;

        const msg = await Message.findById(messageId);

        if (!msg) return res.status(404).json({ error: "Message not found" });

        if (forEveryone) {
            msg.deletedForEveryone = true;
        } else {
            if (!msg.deletedFor.includes(userId)) {
                msg.deletedFor.push(userId);
            }
        }

        await msg.save();

        res.json({ success: true });
    } catch (err) {
        console.log("deleteMessage error:", err);
        res.status(500).json({ error: "Could not delete message" });
    }
};
