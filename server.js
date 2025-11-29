const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

let onlineUsers = {};

// SOCKET.IO
io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("joinRoom", (userId) => {
        socket.join(userId);
    });

    // private message (relays msg object from sender)
    socket.on("sendPrivateMessage", (msg) => {
        io.to(msg.receiverId).emit("privateMessage", msg);
        io.to(msg.senderId).emit("privateMessage", msg); // sender also sees it
    });

    // online presence
    socket.on("userOnline", (userId) => {
        onlineUsers[userId] = socket.id;
        io.emit("onlineUsers", onlineUsers);
    });

    // typing
    socket.on("typing", ({ senderId, receiverId }) => {
        io.to(receiverId).emit("typing", { senderId });
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
        io.to(receiverId).emit("stopTyping", { senderId });
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
            await User.findByIdAndUpdate(disconnectedUserId, {
                lastSeen: Date.now(),
            });
        }

        io.emit("onlineUsers", onlineUsers);
    });
});

server.listen(5000, () => console.log("Server running on 5000"));
