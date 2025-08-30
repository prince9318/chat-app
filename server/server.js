import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize socket.io server
export const io = new Server(server, {
  cors: {
    origin: "https://quickchat-zoip.vercel.app", // fixed typo
    methods: ["GET", "POST"],
  },
});

// Store online users
export const userSocketMap = {}; // { userId: socketId }
const emitOnlineUsers = () => {
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
};

// Socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    emitOnlineUsers();
    // console.log(`✅ User connected: ${userId}`);
  }

  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      emitOnlineUsers();
      // console.log(`❌ User disconnected: ${userId}`);
    }
  });
});

// Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// demo route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes setup
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Serve static files (if self-hosted, not Vercel)
app.use(express.static("client/build"));

// Connect to MongoDB
await connectDB();

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () =>
    console.log("🚀 Server is running on PORT: " + PORT)
  );
}

// Export server for Vercel
export default server;
