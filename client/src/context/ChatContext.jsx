import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

const publicUserEquals = (a, b) => {
  if (!a || !b) return a === b;
  return (
    a._id === b._id &&
    a.fullName === b.fullName &&
    a.email === b.email &&
    (a.profilePic || "") === (b.profilePic || "") &&
    (a.bio || "") === (b.bio || "") &&
    (a.authProvider || "local") === (b.authProvider || "local")
  );
};

const usersListsEqual = (prev, incoming) => {
  if (prev.length !== incoming.length) return false;
  return prev.every((p) => {
    const q = incoming.find((x) => String(x._id) === String(p._id));
    return q && publicUserEquals(p, q);
  });
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios, authUser, onlineUsers } = useContext(AuthContext);
  const selectedUserIdRef = useRef(null);
  useEffect(() => {
    selectedUserIdRef.current = selectedUser?._id || null;
  }, [selectedUser]);

  const getUsers = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers((prev) => {
          const incoming = data.users || [];
          if (usersListsEqual(prev, incoming)) return prev;
          return incoming;
        });
        setUnseenMessages((prev) => {
          const next = data.unseenMessages || {};
          const keys = Object.keys(next);
          const prevKeys = Object.keys(prev);
          if (keys.length !== prevKeys.length) return next;
          for (const k of keys) if (prev[k] !== next[k]) return next;
          return prev;
        });
      }
    } catch (error) {
      if (error?.code !== "ERR_CANCELED") toast.error(error.message);
    }
  }, [axios]);

  const refreshUsers = useCallback(async () => {
    await getUsers();
  }, [getUsers]);

  const getMessages = useCallback(async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages((prev) => {
          const next = data.messages;
          if (prev.length === next.length) {
            const same = prev.every(
              (p, i) =>
                next[i] &&
                p._id === next[i]._id &&
                p.seen === next[i].seen &&
                p.isDeleted === next[i].isDeleted,
            );
            if (same) return prev;
          }
          return next;
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [axios]);

  const sendMessage = useCallback(async (messageData) => {
    const currentId = selectedUserIdRef.current;
    if (!currentId) {
      return { success: false, message: "Select a chat first" };
    }

    try {
      const { data } = await axios.post(
        `/api/messages/send/${currentId}`,
        messageData,
      );
      if (data.success) {
        setMessages((prevMessages) => {
          if (prevMessages.some((m) => m._id === data.newMessage?._id)) {
            return prevMessages;
          }
          return [...prevMessages, data.newMessage];
        });
        return {
          success: true,
          message: data.message,
          newMessage: data.newMessage,
        };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false, message: error.message };
    }
  }, [axios]);

  const sendAudioMessage = useCallback(async (audioBlob) => {
    const currentId = selectedUserIdRef.current;
    if (!currentId) {
      return { success: false, message: "Select a chat first" };
    }
    if (!audioBlob) {
      return { success: false, message: "No audio recorded" };
    }

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, `voice-${Date.now()}.webm`);

      const { data } = await axios.post(
        `/api/messages/send-audio/${currentId}`,
        formData,
      );

      if (data.success) {
        const newMessage = data.newMessage || data.data;
        if (newMessage) {
          setMessages((prevMessages) => {
            if (prevMessages.some((m) => m._id === newMessage._id)) return prevMessages;
            return [...prevMessages, newMessage];
          });
        }
        return { success: true, message: data.message, newMessage };
      }

      toast.error(data.message);
      return { success: false, message: data.message };
    } catch (error) {
      toast.error(error.message);
      return { success: false, message: error.message };
    }
  }, [axios]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleNewMessage = (newMessage) => {
      const currentSelectedId = selectedUserIdRef.current;
      const isForSelectedChat =
        currentSelectedId &&
        (newMessage.senderId === currentSelectedId ||
          newMessage.receiverId === currentSelectedId);

      if (isForSelectedChat) {
        let normalized = newMessage;
        if (newMessage.messageType !== "call") {
          normalized = { ...newMessage, seen: true };
          axios.put(`/api/messages/mark/${newMessage._id}`).catch((err) => {
            toast.error(err.message);
          });
        }
        setMessages((prev) => {
          if (prev.some((m) => m._id === normalized._id)) return prev;
          return [...prev, normalized];
        });
      } else if (newMessage.messageType !== "call") {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, axios]);

  useEffect(() => {
    if (!socket) return;

    const handleMessageSeen = ({ messageId }) => {
      setMessages((prev) => {
        let changed = false;
        const next = prev.map((msg) => {
          if (msg._id === messageId && !msg.seen) {
            changed = true;
            return { ...msg, seen: true };
          }
          return msg;
        });
        return changed ? next : prev;
      });
    };

    const handleMessagesSeen = ({ messageIds }) => {
      if (!Array.isArray(messageIds)) return;
      const idSet = new Set(messageIds);
      setMessages((prev) => {
        let changed = false;
        const next = prev.map((msg) => {
          if (idSet.has(msg._id) && !msg.seen) {
            changed = true;
            return { ...msg, seen: true };
          }
          return msg;
        });
        return changed ? next : prev;
      });
    };

    socket.on("messageSeen", handleMessageSeen);
    socket.on("messagesSeen", handleMessagesSeen);

    return () => {
      socket.off("messageSeen", handleMessageSeen);
      socket.off("messagesSeen", handleMessagesSeen);
    };
  }, [socket]);

  const deleteMessage = useCallback(async (messageId, deleteFor) => {
    try {
      const { data } = await axios.delete(`/api/messages/delete/${messageId}`, {
        data: { deleteFor },
      });

      if (data.success) {
        if (deleteFor === "everyone") {
          setMessages((prev) => {
            let changed = false;
            const next = prev.map((msg) => {
              if (String(msg._id) === String(messageId) && !msg.isDeleted) {
                changed = true;
                return { ...msg, isDeleted: true };
              }
              return msg;
            });
            return changed ? next : prev;
          });
        } else {
          setMessages((prev) =>
            prev.filter((msg) => String(msg._id) !== String(messageId)),
          );
        }

        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  }, [axios]);

  useEffect(() => {
    if (!socket) return;

    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) => {
        let changed = false;
        const next = prev.map((msg) => {
          if (String(msg._id) === String(messageId) && !msg.isDeleted) {
            changed = true;
            return { ...msg, isDeleted: true };
          }
          return msg;
        });
        return changed ? next : prev;
      });
    };

    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [socket]);

  useEffect(() => {
    if (!authUser?._id) return;
    getUsers();
  }, [authUser?._id, getUsers]);

  useEffect(() => {
    if (!Array.isArray(onlineUsers) || onlineUsers.length === 0) return;
    const currentIds = new Set(users.map((u) => String(u._id)));
    const hasNewUnknown = onlineUsers.some(
      (id) =>
        String(id) !== String(authUser?._id || "") && !currentIds.has(String(id)),
    );
    if (!hasNewUnknown) return;
    getUsers();
  }, [onlineUsers, users, authUser?._id, getUsers]);

  useEffect(() => {
    if (!socket) return;

    const onNewUser = (newUser) => {
      if (!newUser || !newUser._id) return;
      if (String(newUser._id) === String(authUser?._id || "")) return;
      setUsers((prev) => {
        const exists = prev.some((u) => String(u._id) === String(newUser._id));
        if (exists) {
          let changed = false;
          const next = prev.map((u) => {
            if (String(u._id) === String(newUser._id) && !publicUserEquals(u, newUser)) {
              changed = true;
              return { ...u, ...newUser };
            }
            return u;
          });
          return changed ? next : prev;
        }
        return [newUser, ...prev];
      });
    };

    const onUserUpdated = (updatedUser) => {
      if (!updatedUser || !updatedUser._id) return;
      setUsers((prev) => {
        let changed = false;
        const next = prev.map((u) => {
          if (String(u._id) === String(updatedUser._id) && !publicUserEquals(u, updatedUser)) {
            changed = true;
            return { ...u, ...updatedUser };
          }
          return u;
        });
        return changed ? next : prev;
      });
      setSelectedUser((prev) => {
        if (!prev) return prev;
        if (String(prev._id) === String(updatedUser._id) && !publicUserEquals(prev, updatedUser)) {
          return { ...prev, ...updatedUser };
        }
        return prev;
      });
    };

    socket.on("newUserRegistered", onNewUser);
    socket.on("userUpdated", onUserUpdated);

    return () => {
      socket.off("newUserRegistered", onNewUser);
      socket.off("userUpdated", onUserUpdated);
    };
  }, [socket, authUser?._id]);

  const addCallLogMessage = useCallback((newMessage) => {
    const currentSelectedId = selectedUserIdRef.current;
    if (
      !currentSelectedId ||
      !newMessage ||
      (newMessage.senderId !== currentSelectedId &&
        newMessage.receiverId !== currentSelectedId)
    )
      return;
    setMessages((prev) => {
      if (prev.some((m) => m._id === newMessage._id)) return prev;
      return [...prev, newMessage];
    });
  }, []);

  const value = useMemo(
    () => ({
      messages,
      users,
      selectedUser,
      getUsers,
      refreshUsers,
      getMessages,
      sendMessage,
      sendAudioMessage,
      deleteMessage,
      setSelectedUser,
      unseenMessages,
      setUnseenMessages,
      addCallLogMessage,
    }),
    [
      messages,
      users,
      selectedUser,
      getUsers,
      refreshUsers,
      getMessages,
      sendMessage,
      sendAudioMessage,
      deleteMessage,
      setSelectedUser,
      unseenMessages,
      setUnseenMessages,
      addCallLogMessage,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
