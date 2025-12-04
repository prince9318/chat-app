import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

// ✅ Context for managing chat-related state & actions globally
export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  // State for messages, users list, selected chat, unseen messages count
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  // Get socket, axios, and authUser from AuthContext
  const { socket, axios, authUser } = useContext(AuthContext);

  // ✅ Fetch all users for sidebar (with unseen messages count)
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Fetch messages for the currently selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Send a new message to the selected user
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        // append new message to local state
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Subscribe to new incoming messages (via socket)
  const subscribeToMessages = () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        // If user is chatting with sender, mark as seen immediately
        newMessage.seen = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`); // mark as seen in DB
      } else {
        // Otherwise increment unseen count for that sender
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  // ✅ Unsubscribe from socket events when cleanup is needed
  const unsubscribeFromMessages = () => {
    if (socket) socket.off("newMessage");
  };

  // Re-subscribe whenever socket or selected user changes
  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  useEffect(() => {
    if (!socket) return;

    const handleMessageSeen = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, seen: true } : msg))
      );
    };

    const handleMessagesSeen = ({ messageIds }) => {
      if (!Array.isArray(messageIds)) return;
      setMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg._id) ? { ...msg, seen: true } : msg
        )
      );
    };

    socket.on("messageSeen", handleMessageSeen);
    socket.on("messagesSeen", handleMessagesSeen);

    return () => {
      if (!socket) return;
      socket.off("messageSeen", handleMessageSeen);
      socket.off("messagesSeen", handleMessagesSeen);
    };
  }, [socket]);

  // ✅ Delete message (for self or everyone)
  const deleteMessage = async (messageId, deleteFor) => {
    try {
      const { data } = await axios.delete(`/api/messages/delete/${messageId}`, {
        data: { deleteFor },
      });

      if (data.success) {
        const currentUserId = authUser?._id || null;

        if (deleteFor === "everyone") {
          // Mark as deleted for all users
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === messageId ? { ...msg, isDeleted: true } : msg
            )
          );
        } else {
          // Delete only for current user (track in deletedFor array)
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg._id !== messageId) return msg;
              const prevDeleted = Array.isArray(msg.deletedFor)
                ? msg.deletedFor
                : [];
              const newDeleted = currentUserId
                ? Array.from(new Set([...prevDeleted, currentUserId]))
                : prevDeleted;
              return { ...msg, deletedFor: newDeleted };
            })
          );
        }

        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Listen for real-time message deletion events
  useEffect(() => {
    if (!socket) return;

    socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, isDeleted: true } : msg
        )
      );
    });

    return () => {
      if (socket) socket.off("messageDeleted");
    };
  }, [socket]);

  // ✅ Values shared across app
  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    sendMessage,
    deleteMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
