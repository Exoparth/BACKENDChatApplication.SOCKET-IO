const router = require("express").Router();
const {
    sendPrivateMessage,
    getConversation,
    markRead,
    getUnreadCounts,
    deleteMessage,
} = require("../controllers/messageController");

router.post("/private", sendPrivateMessage);
router.get("/conversation/:user1/:user2", getConversation);
router.post("/mark-read", markRead);
router.get("/unread-count/:userId", getUnreadCounts);
router.post("/delete", deleteMessage);

module.exports = router;
