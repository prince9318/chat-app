import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeOAuthLogin } = useContext(AuthContext);
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      setStatus("Sign-in failed");
      toast.error(decodeURIComponent(error));
      navigate("/login", { replace: true });
      return;
    }

    if (!token) {
      setStatus("Invalid callback");
      toast.error("Missing authentication token.");
      navigate("/login", { replace: true });
      return;
    }

    completeOAuthLogin(token)
      .then(() => {
        setStatus("Success! Redirecting...");
        navigate("/", { replace: true });
      })
      .catch((err) => {
        setStatus("Sign-in failed");
        toast.error(err.message || "Could not complete sign-in.");
        navigate("/login", { replace: true });
      });
  }, [searchParams, completeOAuthLogin, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-app)]">
      <div className="w-full max-w-sm rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-8 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        <p className="text-[var(--text-primary)] font-medium">{status}</p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Please wait a moment...
        </p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
