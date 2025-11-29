const router = require("express").Router();
const User = require("../models/User");

router.get("/all", async (req, res) => {
    try {
        const users = await User.find().select("_id name email lastSeen");
        res.json({ success: true, users });
    } catch (err) {
        res.json({ error: err });
    }
});
router.get("/:id", async (req, res) => {
    const user = await User.findById(req.params.id).select("_id name email lastSeen");
    res.json({ user });
});


module.exports = router;
