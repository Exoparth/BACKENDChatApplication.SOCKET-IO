const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  avatarUrl: {
    type: String,
    default: "", // can be blank, frontend can show initials
  },
  lastSeen: { type: Number, default: Date.now },
  pinnedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
