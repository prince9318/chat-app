import { useContext, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

const ResetPasswordPage = () => {
  const { axios } = useContext(AuthContext);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const initialEmail = params.get("email") || "";
  const initialToken = params.get("token") || "";

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    if (!email || !token) return false;
    if (!password || password.length < 6) return false;
    if (password !== confirmPassword) return false;
    return true;
  }, [email, token, password, confirmPassword]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/reset-password", {
        email,
        token,
        password,
      });
      if (data?.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data?.message || "Something went wrong");
      }
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full relative overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center py-6 sm:py-12 px-4 sm:px-6">
      {/* Dynamic ambient atmosphere */}
      <div className="fixed inset-0 bg-[#090e13] pointer-events-none" />
      <div
        className="fixed inset-0 pointer-events-none opacity-45"
        style={{
          background:
            "radial-gradient(circle 600px at 15% 30%, rgba(147, 110, 255, 0.16), transparent 70%), radial-gradient(circle 600px at 85% 70%, rgba(0, 168, 132, 0.14), transparent 70%)",
        }}
      />
      <div
        className="fixed inset-0 opacity-[0.25] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1.5px 1.5px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative z-10 w-full max-w-[420px] my-auto rounded-3xl border border-white/10 bg-[#111b21]/95 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Reset password
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Set a new password for your account.
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            name="email"
            aria-label="Email address"
            required
            placeholder="Email"
            className="input-field"
          />
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            type="text"
            name="token"
            aria-label="Reset token"
            required
            placeholder="Reset token"
            className="input-field"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            name="password"
            aria-label="New password"
            required
            minLength={6}
            placeholder="New password (min 6 chars)"
            className="input-field"
          />
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            name="confirmPassword"
            aria-label="Confirm new password"
            required
            minLength={6}
            placeholder="Confirm new password"
            className="input-field"
          />

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="py-3 rounded-[var(--radius-md)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>

        <div className="mt-6 text-sm text-[var(--text-secondary)] flex gap-3">
          <Link to="/login" className="text-[var(--accent)] hover:underline">
            Back to login
          </Link>
          <span className="opacity-60">•</span>
          <Link
            to="/forgot-password"
            className="text-[var(--accent)] hover:underline"
          >
            Resend link
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

