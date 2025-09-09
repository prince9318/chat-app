import { createContext, useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// ✅ Set backend URL from environment variable
const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

// Create AuthContext for managing authentication globally
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Store authentication state
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]); // list of currently online users
  const [socket, setSocket] = useState(null); // active socket connection
  const socketRef = useRef(null); // reference to socket instance (stable across re-renders)

  // ✅ Helper: compare two arrays to avoid unnecessary re-renders
  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    const setA = new Set(a);
    const setB = new Set(b);
    if (setA.size !== setB.size) return false;
    for (let val of setA) if (!setB.has(val)) return false;
    return true;
  };

  // ✅ Check if user is authenticated (used on page refresh)
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user); // save logged-in user
        connectSocket(data.user); // connect to socket server
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Handle login / signup
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        axios.defaults.headers.common["token"] = data.token; // attach token for future requests
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
        connectSocket(data.userData); // connect to socket after login
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Logout user and clear session
  const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["token"] = null;
    toast.success("Logged out successfully");

    // disconnect socket if exists
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
  };

  // ✅ Update user profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user); // update user state
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Establish socket connection (only once per user)
  const connectSocket = useCallback((userData) => {
    if (!userData || socketRef.current?.connected) return;

    // create socket connection with userId
    socketRef.current = io(backendUrl, {
      query: { userId: userData._id },
      transports: ["websocket"],
    });

    // when socket connects
    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
      setSocket(socketRef.current);
    });

    // listen for online users list
    socketRef.current.on("getOnlineUsers", (userIds) => {
      setOnlineUsers((prev) => {
        if (arraysEqual(prev, userIds)) return prev; // prevent unnecessary updates
        return userIds;
      });
    });

    // when socket disconnects
    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
      setSocket(null);
    });
  }, []);

  // ✅ On mount: check auth if token exists + cleanup socket on unmount
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

  // ✅ Values exposed to other components
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
