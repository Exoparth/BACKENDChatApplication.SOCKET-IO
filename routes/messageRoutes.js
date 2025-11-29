const router = require("express").Router();
const { sendMessage, getMessages, getConversation, sendPrivateMessage } = require("../controllers/messageController");

// POST → Save a new message
router.post("/send", sendMessage);

// GET → Get all messages
router.get("/all", getMessages);

router.post("/private", sendPrivateMessage);
router.get("/conversation/:user1/:user2", getConversation);
module.exports = router;
