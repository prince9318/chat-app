import { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "./context/AuthContext";
import { CallContext } from "./context/CallContext";
import IncomingCallModal from "./components/IncomingCallModal";
import OutgoingCallModal from "./components/OutgoingCallModal";
import InCallScreen from "./components/InCallScreen";

const App = () => {
  const { authUser } = useContext(AuthContext);
  const { callState } = useContext(CallContext);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)]">
      <Toaster />
      {callState === "incoming" && <IncomingCallModal />}
      {callState === "outgoing" && <OutgoingCallModal />}
      {callState === "connected" && <InCallScreen />}
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
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>
    </div>
  );
};

export default App;
