import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// Get all users except the logged in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all users except current user
    const filteredUsers = await User.find({ _id: { $ne: userId } })
      .select("-password")
      .lean();

    // Count unseen messages for each user using aggregation for better performance
    const usersWithUnseenCount = await Promise.all(
      filteredUsers.map(async (user) => {
        const unseenCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: userId,
          seen: false,
        });

        return {
          ...user,
          unseenCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      users: usersWithUnseenCount,
    });
  } catch (error) {
    console.error("Get users error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// Get all messages for selected user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    // Validate selected user exists
    const selectedUser = await User.findById(selectedUserId);
    if (!selectedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get messages between users
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 }); // Sort by creation time

    // Mark messages as seen in bulk
    await Message.updateMany(
      {
        senderId: selectedUserId,
        receiverId: myId,
        seen: false,
      },
      { seen: true }
    );

    // Emit read receipt if needed
    const receiverSocketId = userSocketMap[selectedUserId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messagesRead", { readerId: myId });
    }

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get messages error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

// Mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    // Verify user has permission to mark this message as seen
    const message = await Message.findOne({
      _id: messageId,
      receiverId: userId,
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found or access denied",
      });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { seen: true },
      { new: true }
    );

    // Notify sender that message was seen
    const senderSocketId = userSocketMap[updatedMessage.senderId];
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageSeen", {
        messageId: updatedMessage._id,
        seenAt: updatedMessage.updatedAt,
      });
    }

    res.status(200).json({
      success: true,
      message: updatedMessage,
    });
  } catch (error) {
    console.error("Mark message seen error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to mark message as seen",
    });
  }
};

// Send message to selected user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // Validate message content
    if (!text && !image) {
      return res.status(400).json({
        success: false,
        message: "Message text or image is required",
      });
    }

    let imageUrl;
    if (image) {
      // Validate image format
      if (!image.startsWith("data:image/")) {
        return res.status(400).json({
          success: false,
          message: "Invalid image format",
        });
      }

      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "chat-images",
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" },
        ],
      });
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text?.trim(),
      image: imageUrl,
    });

    // Populate sender info for real-time emission
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "fullName profilePic")
      .lean();

    // Emit to receiver
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", populatedMessage);
    }

    // Emit to sender for real-time update
    const senderSocketId = userSocketMap[senderId];
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", populatedMessage);
    }

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};
