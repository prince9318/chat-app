import { createContext, useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  // helper to compare arrays (avoid unnecessary updates)
  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    const setA = new Set(a);
    const setB = new Set(b);
    if (setA.size !== setB.size) return false;
    for (let val of setA) if (!setB.has(val)) return false;
    return true;
  };

  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        axios.defaults.headers.common["token"] = data.token;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
        connectSocket(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["token"] = null;
    toast.success("Logged out successfully");
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
  };

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ stable socket connection (only once per user)
  const connectSocket = useCallback((userData) => {
    if (!userData || socketRef.current?.connected) return;

    socketRef.current = io(backendUrl, {
      query: { userId: userData._id },
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
      setSocket(socketRef.current);
    });

    socketRef.current.on("getOnlineUsers", (userIds) => {
      setOnlineUsers((prev) => {
        if (arraysEqual(prev, userIds)) return prev;
        return userIds;
      });
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
      setSocket(null);
    });
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
      checkAuth();
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
