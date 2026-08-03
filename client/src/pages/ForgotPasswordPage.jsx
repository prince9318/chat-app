import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

const ForgotPasswordPage = () => {
  const { axios } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [responseType, setResponseType] = useState("info");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDevResetUrl("");
    setResponseMessage("");
    try {
      const { data } = await axios.post("/api/auth/forgot-password", { email });
      if (data?.success) {
        toast.success(data.message);
        setResponseType("success");
        setResponseMessage(data.message);
        if (data.resetUrl) setDevResetUrl(data.resetUrl);
      } else {
        const message = data?.message || "Something went wrong";
        toast.error(message);
        setResponseType("error");
        setResponseMessage(message);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Something went wrong";
      toast.error(message);
      setResponseType("error");
      setResponseMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-app)] via-[#0d1318] to-[#0a1628]" />
      <div className="relative z-10 w-[min(95vw,420px)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-[var(--bg-panel)]/95 backdrop-blur-xl p-7 sm:p-8 shadow-[var(--shadow-card)]">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Forgot password
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Enter your email and we’ll send you a reset link.
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="Email"
            className="input-field"
          />

          <button
            type="submit"
            disabled={loading}
            className="py-3 rounded-[var(--radius-md)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        {responseMessage && (
          <div
            className={`mt-4 rounded-[var(--radius-md)] border p-3 text-sm ${
              responseType === "error"
                ? "border-red-500/40 bg-red-500/10 text-red-200"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {responseMessage}
          </div>
        )}

        {devResetUrl && (
          <div className="mt-5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-input)] p-3">
            <p className="text-xs text-[var(--text-secondary)]">
              SMTP is not configured on the backend. Use this link to reset:
            </p>
            <a
              className="mt-2 block text-sm text-[var(--accent)] hover:underline break-all"
              href={devResetUrl}
            >
              {devResetUrl}
            </a>
          </div>
        )}

        <div className="mt-6 text-sm text-[var(--text-secondary)]">
          <Link to="/login" className="text-[var(--accent)] hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

