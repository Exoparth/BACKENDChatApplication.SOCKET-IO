const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

let onlineUsers = {};

// SOCKET.IO CONNECTION ↓↓↓
io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    // join room = userId
    socket.on("joinRoom", (userId) => {
        socket.join(userId);
    });

    // private messaging
    socket.on("sendPrivateMessage", (data) => {
        // Send to receiver
        io.to(data.receiverId).emit("privateMessage", data);

        // Send back to sender also
        io.to(data.senderId).emit("privateMessage", data);
    });

    socket.on("userOnline", (userId) => {
        onlineUsers[userId] = socket.id;   // ✅ store socket.id
        io.emit("onlineUsers", onlineUsers);
    });

    socket.on("disconnect", async () => {
        let disconnectedUserId = null;

        for (const userId in onlineUsers) {
            if (onlineUsers[userId] === socket.id) {
                disconnectedUserId = userId;
                delete onlineUsers[userId];
                break;
            }
        }

        if (disconnectedUserId) {
            const User = require("./models/User");
            await User.findByIdAndUpdate(disconnectedUserId, {
                lastSeen: Date.now(),
            });
        }

        io.emit("onlineUsers", onlineUsers);
    });

    // Typing started
    socket.on("typing", ({ senderId, receiverId }) => {
        io.to(receiverId).emit("typing", { senderId });
    });

    // Typing stopped
    socket.on("stopTyping", ({ senderId, receiverId }) => {
        io.to(receiverId).emit("stopTyping", { senderId });
    });

});


server.listen(5000, () => console.log("Server running on 5000"));
