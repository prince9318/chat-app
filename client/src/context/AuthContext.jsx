import { createContext, useEffect, useState, useRef, useCallback, useMemo } from "react";
import axiosInstance from "../lib/axiosInstance";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const axios = axiosInstance;

const TOKEN_KEY = "token";

const arraysEqual = (a, b) => {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size !== setB.size) return false;
  for (let val of setA) if (!setB.has(val)) return false;
  return true;
};

const readStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const saveStoredToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* noop */
  }
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [, setToken] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(null);
  const [pendingVerificationInfo, setPendingVerificationInfo] = useState(null);

  useEffect(() => {
    const userId = authUser?._id;
    if (!userId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return undefined;
    }

    const s = io(backendUrl, {
      query: { userId },
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = s;

    const handleConnect = () => {
      setSocket(s);
    };

    const handleOnlineUsers = (userIds) => {
      setOnlineUsers((prev) => {
        if (arraysEqual(prev, userIds)) return prev;
        return userIds;
      });
    };

    const handleDisconnect = () => {
      setSocket(null);
    };

    s.on("connect", handleConnect);
    s.on("getOnlineUsers", handleOnlineUsers);
    s.on("disconnect", handleDisconnect);

    return () => {
      s.off("connect", handleConnect);
      s.off("getOnlineUsers", handleOnlineUsers);
      s.off("disconnect", handleDisconnect);
      s.disconnect();
      if (socketRef.current === s) {
        socketRef.current = null;
      }
      setSocket(null);
    };
  }, [authUser?._id]);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, []);

  const applyIncomingToken = useCallback((newToken) => {
    setToken(newToken);
    saveStoredToken(newToken);
    axios.defaults.headers.common["token"] = newToken;
  }, []);

  const login = useCallback(async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        if (data.requiresVerification) {
          setPendingVerificationEmail(data.email || credentials.email);
          setPendingVerificationInfo({
            emailSent: data.emailSent,
            otp: data.otp,
            verifyUrl: data.verifyUrl,
            devOtp: data.devOtp,
            devVerifyUrl: data.devVerifyUrl,
            mailError: data.mailError,
            userFacingMailError: data.userFacingMailError,
            mailProvider: data.mailProvider,
          });
          toast.success(data.message);
          return { requiresVerification: true };
        }

        if (data.userData && data.token) {
          setAuthUser(data.userData);
          applyIncomingToken(data.token);
          setPendingVerificationEmail(null);
          setPendingVerificationInfo(null);
          toast.success(data.message);
          return { success: true };
        }

        toast.success(data.message);
        return { success: true };
      } else {
        if (data.requiresVerification) {
          setPendingVerificationEmail(data.email || credentials.email);
          setPendingVerificationInfo({
            emailSent: data.emailSent,
            otp: data.otp,
            verifyUrl: data.verifyUrl,
            devOtp: data.devOtp,
            devVerifyUrl: data.devVerifyUrl,
            mailError: data.mailError,
            userFacingMailError: data.userFacingMailError,
            mailProvider: data.mailProvider,
          });
        }
        toast.error(data.message);
        return {
          success: false,
          requiresVerification: data.requiresVerification || false,
        };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false };
    }
  }, [applyIncomingToken]);

  const verifyEmail = useCallback(async (payload) => {
    try {
      const { data } = await axios.post("/api/auth/verify-email", payload);
      if (data.success) {
        setAuthUser(data.userData);
        applyIncomingToken(data.token);
        setPendingVerificationEmail(null);
        setPendingVerificationInfo(null);
        toast.success(data.message);
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false, message: error.message };
    }
  }, [applyIncomingToken]);

  const resendVerificationEmail = useCallback(async (email) => {
    try {
      const { data } = await axios.post("/api/auth/resend-verification-email", {
        email,
      });
      if (data.success) {
        setPendingVerificationInfo({
          emailSent: data.emailSent,
          otp: data.otp,
          verifyUrl: data.verifyUrl,
          devOtp: data.devOtp,
          devVerifyUrl: data.devVerifyUrl,
          mailError: data.mailError,
          userFacingMailError: data.userFacingMailError,
          mailProvider: data.mailProvider,
        });
        if (data.alreadyVerified) {
          toast.success(data.message);
          return { success: true, alreadyVerified: true };
        }
        toast.success(data.message);
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false };
    }
  }, []);

  const clearVerificationState = useCallback(() => {
    setPendingVerificationEmail(null);
    setPendingVerificationInfo(null);
  }, []);

  const completeOAuthLogin = useCallback(async (oauthToken) => {
    applyIncomingToken(oauthToken);
    try {
      await axios.post("/api/auth/migrate-token", { token: oauthToken });
    } catch {
      /* token may already be set via cookie from redirect */
    }

    const { data } = await axios.get("/api/auth/check");
    if (!data.success) {
      saveStoredToken(null);
      delete axios.defaults.headers.common["token"];
      setToken(null);
      throw new Error(data.message || "Authentication failed");
    }

    setAuthUser(data.user);
    toast.success("Signed in successfully");
  }, [applyIncomingToken]);

  const logout = useCallback(async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch {
      /* ignore */
    }
    saveStoredToken(null);
    delete axios.defaults.headers.common["token"];
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    setPendingVerificationEmail(null);
    setPendingVerificationInfo(null);
    toast.success("Logged out successfully");

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
  }, []);

  const updateProfile = useCallback(async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, []);

  useEffect(() => {
    let disposed = false;
    (async () => {
      const stored = readStoredToken();
      if (stored) {
        applyIncomingToken(stored);
      }
      if (disposed) return;
      await checkAuth();
    })();
    return () => {
      disposed = true;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [applyIncomingToken, checkAuth]);

  const value = useMemo(
    () => ({
      axios,
      authUser,
      onlineUsers,
      socket,
      login,
      verifyEmail,
      resendVerificationEmail,
      clearVerificationState,
      logout,
      updateProfile,
      completeOAuthLogin,
      pendingVerificationEmail,
      pendingVerificationInfo,
    }),
    [
      authUser,
      onlineUsers,
      socket,
      login,
      verifyEmail,
      resendVerificationEmail,
      clearVerificationState,
      logout,
      updateProfile,
      completeOAuthLogin,
      pendingVerificationEmail,
      pendingVerificationInfo,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
