import { Suspense, lazy, useContext, useMemo } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "./context/AuthContext";
import { CallContext } from "./context/CallContext";
import IncomingCallModal from "./components/IncomingCallModal";
import OutgoingCallModal from "./components/OutgoingCallModal";
import InCallScreen from "./components/InCallScreen";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const OAuthCallbackPage = lazy(() => import("./pages/OAuthCallbackPage"));
const EmailVerificationPage = lazy(() => import("./pages/EmailVerificationPage"));

const PageSuspense = ({ children }) => (
  <Suspense
    fallback={
      <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    }
  >
    {children}
  </Suspense>
);

const ProtectedRoute = ({ authUser, children, invert = false }) => {
  const shouldRender = invert ? !authUser : authUser;
  if (!shouldRender) {
    return <Navigate to={invert ? "/" : "/login"} replace />;
  }
  return children;
};

const App = () => {
  const { authUser } = useContext(AuthContext);
  const { callState } = useContext(CallContext);

  const routes = useMemo(
    () => (
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute authUser={authUser}>
              <PageSuspense>
                <HomePage />
              </PageSuspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <ProtectedRoute authUser={authUser} invert>
              <PageSuspense>
                <LoginPage />
              </PageSuspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ProtectedRoute authUser={authUser} invert>
              <PageSuspense>
                <ForgotPasswordPage />
              </PageSuspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute authUser={authUser} invert>
              <PageSuspense>
                <ResetPasswordPage />
              </PageSuspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <PageSuspense>
              <EmailVerificationPage />
            </PageSuspense>
          }
        />
        <Route
          path="/auth/callback"
          element={
            <PageSuspense>
              <OAuthCallbackPage />
            </PageSuspense>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute authUser={authUser}>
              <PageSuspense>
                <ProfilePage />
              </PageSuspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/terms"
          element={
            <PageSuspense>
              <TermsPage />
            </PageSuspense>
          }
        />
        <Route
          path="/privacy"
          element={
            <PageSuspense>
              <PrivacyPage />
            </PageSuspense>
          }
        />
      </Routes>
    ),
    [authUser],
  );

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)]">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--bg-message)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-primary)",
          },
        }}
      />
      {callState === "incoming" && <IncomingCallModal />}
      {callState === "outgoing" && <OutgoingCallModal />}
      {callState === "connected" && <InCallScreen />}
      {routes}
    </div>
  );
};

export default App;
