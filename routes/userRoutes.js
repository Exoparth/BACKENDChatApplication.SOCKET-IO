const router = require("express").Router();
const User = require("../models/User");

// Get all users
router.get("/all", async (req, res) => {
    try {
        const users = await User.find().select("_id name email avatarUrl lastSeen pinnedUsers");
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ error: "Error fetching users" });
    }
});

// Get single user
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select(
            "_id name email avatarUrl lastSeen pinnedUsers"
        );
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ error: "Error fetching user" });
    }
});

// Pin / unpin chat
router.post("/pin", async (req, res) => {
    try {
        const { userId, targetId } = req.body; // user who is pinning, and the person to pin

        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ error: "User not found" });

        const alreadyPinned = user.pinnedUsers.some(
            (id) => id.toString() === targetId
        );

        if (alreadyPinned) {
            user.pinnedUsers = user.pinnedUsers.filter(
                (id) => id.toString() !== targetId
            );
        } else {
            user.pinnedUsers.push(targetId);
        }

        await user.save();

        res.json({ success: true, pinnedUsers: user.pinnedUsers });
    } catch (err) {
        res.status(500).json({ error: "Error updating pinned chats" });
    }
});

module.exports = router;
