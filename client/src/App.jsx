import { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "./context/AuthContext";

const App = () => {
  const { authUser } = useContext(AuthContext); // ✅ Access current authenticated user

  return (
    <div className="min-h-screen bg-[#0b141a] text-[#e9edef]">
      {/* ✅ Toast notifications (for success/error messages) */}
      <Toaster />
      {/* ✅ Define application routes */}
      <Routes>
        {/* Home route — accessible only if logged in */}
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        {/* Login route — redirect to home if already logged in */}
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        {/* Profile route — only accessible when authenticated */}
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
};

export default App;
