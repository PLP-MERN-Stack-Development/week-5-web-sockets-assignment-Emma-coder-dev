require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const Message = require("./models/Message");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chatDB";
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Online users tracking: { socketId: { username, room } }
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("⚡ Client connected");

  socket.on("joinRoom", async ({ username, room }) => {
    socket.username = username;
    socket.room = room;
    socket.join(room);
    onlineUsers[socket.id] = { username, room };

    // send message history
    const history = await Message.find({ room }).sort({ timestamp: 1 });
    socket.emit("messageHistory", history);

    // notify others
    socket.to(room).emit("notification", { type: "join", username });
    io.to(room).emit("users", Object.values(onlineUsers)
      .filter(u => u.room === room)
      .map(u => u.username)
    );
  });

  socket.on("typing", () => {
    socket.to(socket.room).emit("typing", socket.username);
  });

  socket.on("chatMessage", async ({ username, room, message }) => {
    const msg = new Message({ username, room, message, timestamp: new Date(), reactions: {} });
    await msg.save();
    io.to(room).emit("message", msg);
  });

  socket.on("privateMessage", ({ to, message }) => {
    const from = socket.username;
    io.to(to).emit("privateMessage", { from, message, timestamp: new Date() });
  });

  socket.on("reactMessage", async ({ messageId, emoji }) => {
    const msg = await Message.findById(messageId);
    if (!msg.reactions) msg.reactions = {};
    msg.reactions[emoji] = (msg.reactions[emoji] || 0) + 1;
    await msg.save();
    io.to(msg.room).emit("reactionUpdate", { messageId, emoji });
  });

  socket.on("disconnect", () => {
    const user = onlineUsers[socket.id];
    if (user) {
      const { username, room } = user;
      delete onlineUsers[socket.id];
      socket.to(room).emit("notification", { type: "leave", username });
      io.to(room).emit("users", Object.values(onlineUsers)
        .filter(u => u.room === room)
        .map(u => u.username)
      );
    }
    console.log("👋 Client disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
