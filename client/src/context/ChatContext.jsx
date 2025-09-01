import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

// Context for managing chat functionality
export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios, authUser } = useContext(AuthContext);

  // function to get all users for sidebar
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

  // function to get messages for selected user
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

  // function to send message to selected user
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to subscribe to messages for selected user
  const subscribeToMessages = async () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
            ? prevUnseenMessages[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  // function to unsubscribe from messages
  const unsubscribeFromMessages = () => {
    if (socket) socket.off("newMessage");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  // function to delete message
  const deleteMessage = async (messageId, deleteFor) => {
    try {
      const { data } = await axios.delete(`/api/messages/delete/${messageId}`, {
        data: { deleteFor },
      });

      if (data.success) {
        const currentUserId = authUser?._id || null;

        if (deleteFor === "everyone") {
          // Mark as deleted for all users
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg._id === messageId ? { ...msg, isDeleted: true } : msg
            )
          );
        } else {
          // Delete only for current user — ensure deletedFor is an array
          setMessages((prevMessages) =>
            prevMessages.map((msg) => {
              if (msg._id !== messageId) return msg;
              const prevDeleted = Array.isArray(msg.deletedFor)
                ? msg.deletedFor
                : [];
              // Prevent duplicates
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

  // Listen for message deletion events
  useEffect(() => {
    if (!socket) return;

    socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, isDeleted: true } : msg
        )
      );
    });

    return () => {
      if (socket) socket.off("messageDeleted");
    };
  }, [socket]);

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
