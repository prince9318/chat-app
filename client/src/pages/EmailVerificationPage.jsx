import { useCallback, useContext, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const VerificationSuccessView = ({ onGoToChat }) => (
  <div className="min-h-screen w-full relative overflow-y-auto overflow-x-hidden flex flex-col items-center py-8 sm:py-12 px-4">
    <div className="fixed inset-0 bg-gradient-to-br from-[var(--bg-app)] via-[#0d1318] to-[#0a1628] pointer-events-none" />
    <div className="relative z-10 w-[min(95vw,460px)] my-auto rounded-[var(--radius-2xl)] border border-emerald-500/30 bg-[var(--bg-panel)]/95 backdrop-blur-xl p-7 sm:p-8 shadow-[var(--shadow-card)] text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 text-2xl">
        ✓
      </div>
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">
        Email verified
      </h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Your email has been verified successfully. You are now signed in.
      </p>
      <button
        type="button"
        onClick={onGoToChat}
        className="mt-6 w-full py-3 rounded-[var(--radius-md)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors"
      >
        Go to chat
      </button>
    </div>
  </div>
);

const VerificationProgressView = () => (
  <div className="min-h-screen w-full relative overflow-y-auto overflow-x-hidden flex flex-col items-center py-8 sm:py-12 px-4">
    <div className="fixed inset-0 bg-gradient-to-br from-[var(--bg-app)] via-[#0d1318] to-[#0a1628] pointer-events-none" />
    <div className="relative z-10 w-[min(95vw,460px)] my-auto rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-[var(--bg-panel)]/95 backdrop-blur-xl p-7 sm:p-8 shadow-[var(--shadow-card)] text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-2xl animate-pulse">
        ···
      </div>
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">
        Verifying your email...
      </h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Please wait a moment while we verify your email address.
      </p>
    </div>
  </div>
);

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { authUser, verifyEmail, resendVerificationEmail } = useContext(AuthContext);

  const token = searchParams.get("token");
  const emailFromUrl = searchParams.get("email");

  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [manualToken, setManualToken] = useState("");
  const MV_OTP_SLOTS = ["mv-slot-0", "mv-slot-1", "mv-slot-2", "mv-slot-3", "mv-slot-4", "mv-slot-5"];
  const [otpInputs, setOtpInputs] = useState(["", "", "", "", "", ""]);
  const [useOtp, setUseOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleVerify = useCallback(
    async (payload) => {
      setStatus("verifying");
      setErrorMessage("");
      const result = await verifyEmail(payload);
      if (result?.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(
          result?.message || "Verification failed. Please try again."
        );
        setShowManualForm(true);
      }
    },
    [verifyEmail]
  );

  useEffect(() => {
    if (authUser) {
      navigate("/", { replace: true });
      return;
    }
    if (token && emailFromUrl) {
      handleVerify({ email: emailFromUrl, token });
    } else {
      setShowManualForm(true);
    }
  }, [token, emailFromUrl, authUser, handleVerify, navigate]);

  const handleResend = async () => {
    const targetEmail = manualEmail || emailFromUrl;
    if (!targetEmail) return;
    setIsResending(true);
    setResendMessage("");
    try {
      const result = await resendVerificationEmail(targetEmail);
      if (result?.success) {
        setResendMessage("If an account exists for that email, a new verification email was sent.");
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    let payload;
    if (useOtp) {
      const otp = otpInputs.join("");
      if (otp.length !== 6 || !manualEmail) return;
      payload = { email: manualEmail, otp };
    } else {
      if (!manualEmail || !manualToken) return;
      payload = { email: manualEmail, token: manualToken };
    }
    setIsSubmitting(true);
    try {
      await handleVerify(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const next = [...otpInputs];
    next[index] = value;
    setOtpInputs(next);
    if (value && index < 5) {
      const nextInput = document.getElementById(`mv-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpInputs[index] && index > 0) {
      const prevInput = document.getElementById(`mv-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  if (status === "success") {
    return (
      <VerificationSuccessView
        onGoToChat={() => navigate("/", { replace: true })}
      />
    );
  }

  if (status === "verifying" && !showManualForm) {
    return <VerificationProgressView />;
  }

  const otpComplete = otpInputs.every((d) => d !== "");

  return (
    <div className="min-h-screen w-full relative overflow-y-auto overflow-x-hidden flex flex-col items-center py-8 sm:py-12 px-4">
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--bg-app)] via-[#0d1318] to-[#0a1628] pointer-events-none" />
      <div className="relative z-10 w-[min(95vw,460px)] my-auto rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-[var(--bg-panel)]/95 backdrop-blur-xl p-7 sm:p-8 shadow-[var(--shadow-card)]">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Verify your email
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {showManualForm
            ? "Enter your email and verification code or token to confirm your account."
            : "We couldn't verify your link automatically. You can verify manually below."}
        </p>

        {status === "error" && errorMessage && (
          <div className="mt-4 rounded-[var(--radius-md)] border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleManualSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="manual-email" className="block text-sm mb-1.5 text-[var(--text-secondary)]">
              Email address
            </label>
            <input
              id="manual-email"
              name="manualEmail"
              aria-label="Email address"
              value={manualEmail || emailFromUrl || ""}
              onChange={(e) => setManualEmail(e.target.value)}
              type="email"
              required
              placeholder="you@example.com"
              className="input-field"
            />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => {
                setUseOtp(false);
                setOtpInputs(["", "", "", "", "", ""]);
              }}
              className={`px-3 py-1.5 rounded-full border transition-colors ${
                !useOtp
                  ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                  : "border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Use link token
            </button>
            <button
              type="button"
              onClick={() => {
                setUseOtp(true);
                setManualToken("");
              }}
              className={`px-3 py-1.5 rounded-full border transition-colors ${
                useOtp
                  ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                  : "border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Use 6-digit code
            </button>
          </div>

          {!useOtp ? (
            <div>
              <label htmlFor="manual-token" className="block text-sm mb-1.5 text-[var(--text-secondary)]">
                Verification token (from the URL in your email)
              </label>
              <input
                id="manual-token"
                name="manualToken"
                aria-label="Verification token"
                value={manualToken || token || ""}
                onChange={(e) => setManualToken(e.target.value)}
                type="text"
                required
                placeholder="Paste the long token here..."
                className="input-field font-mono text-xs"
              />
            </div>
          ) : (
            <div>
              <p className="block text-sm mb-2 text-[var(--text-secondary)]">
                6-digit verification code
              </p>
              <div className="flex justify-between gap-2 sm:gap-3">
                {otpInputs.map((d, i) => (
                  <input
                    key={MV_OTP_SLOTS[i]}
                    id={`mv-otp-${i}`}
                    aria-label={`Digit ${i + 1} of verification code`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-full aspect-square text-center text-xl font-semibold rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
                  />
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={
              isSubmitting ||
              !manualEmail ||
              (!useOtp ? !manualToken : !otpComplete)
            }
            className="mt-1 py-3 rounded-[var(--radius-md)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-[var(--border-subtle)] flex flex-col gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || !(manualEmail || emailFromUrl)}
            className="text-sm text-[var(--accent)] hover:underline disabled:opacity-60 disabled:no-underline disabled:cursor-not-allowed"
          >
            {isResending ? "Sending new code..." : "Resend verification email"}
          </button>
          {resendMessage && (
            <p className="text-xs text-emerald-400/90">{resendMessage}</p>
          )}
          <Link
            to="/login"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
