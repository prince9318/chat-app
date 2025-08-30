import { createContext, useEffect, useState } from "react";
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

  // ✅ helper to compare arrays (avoid unnecessary updates)
  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    const setA = new Set(a);
    const setB = new Set(b);
    if (setA.size !== setB.size) return false;
    for (let val of setA) if (!setB.has(val)) return false;
    return true;
  };

  // Check if user is authenticated and if so, set the user data and connect the socket
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

  // Login function to handle user authentication and socket connection

  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        axios.defaults.headers.common["token"] = data.token;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Logout function to handle user logout and socket disconnection

  const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["token"] = null;
    toast.success("Logged out successfully");
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  // Update profile function to handle user profile updates

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

  // Connect socket function to handle socket connection and online users updates
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendUrl, {
      query: {
        userId: userData._id,
        transports: ["websocket"], // force websocket, avoid polling flickers
      },
    });
    setSocket(newSocket);
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers((prev) => {
        if (arraysEqual(prev, userIds)) return prev; // ✅ don’t update if same
        return userIds;
      });
    });
    // ✅ cleanup on unmount
    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
      checkAuth();
    }
    // cleanup socket on unmount
    return () => {
      if (socket) socket.disconnect();
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
