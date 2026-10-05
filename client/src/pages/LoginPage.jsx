import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";
import OAuthButtons from "../components/OAuthButtons";

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showAgreementError, setShowAgreementError] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const OTP_SLOTS = ["slot-0", "slot-1", "slot-2", "slot-3", "slot-4", "slot-5"];
  const [otpInputs, setOtpInputs] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    login,
    verifyEmail,
    resendVerificationEmail,
    clearVerificationState,
    pendingVerificationEmail,
    pendingVerificationInfo,
  } = useContext(AuthContext);

  const isSignup = currState === "Sign up";
  const effectiveEmail = pendingVerificationEmail || email;

  const effectiveOtp =
    pendingVerificationInfo?.otp || pendingVerificationInfo?.devOtp;
  const effectiveVerifyUrl =
    pendingVerificationInfo?.verifyUrl || pendingVerificationInfo?.devVerifyUrl;
  const emailDelivered = Boolean(pendingVerificationInfo?.emailSent);
  const showFallbackPanel =
    Boolean(effectiveOtp) || Boolean(effectiveVerifyUrl);
  const providerLabel =
    pendingVerificationInfo?.mailProvider &&
    pendingVerificationInfo.mailProvider !== "none"
      ? pendingVerificationInfo.mailProvider.toUpperCase()
      : null;

  useEffect(() => {
    if (pendingVerificationEmail) {
      setVerificationStep(true);
    }
  }, [pendingVerificationEmail]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const resetToForm = () => {
    setVerificationStep(false);
    setOtpInputs(["", "", "", "", "", ""]);
    setIsVerifying(false);
    clearVerificationState();
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (isSignup && !agreed) {
      setShowAgreementError(true);
      return;
    }
    if (isSignup && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }
    const result = await login(isSignup ? "signup" : "login", {
      fullName,
      email,
      password,
      bio,
      ...(isSignup ? { agreedToTerms: agreed } : {}),
    });
    if (result?.requiresVerification) {
      setVerificationStep(true);
      setResendCooldown(60);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const next = [...otpInputs];
    next[index] = value;
    setOtpInputs(next);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpInputs[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    const otp = otpInputs.join("");
    if (otp.length !== 6) return;
    setIsVerifying(true);
    try {
      await verifyEmail({ email: effectiveEmail, otp });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    try {
      const result = await resendVerificationEmail(effectiveEmail);
      if (result?.alreadyVerified) {
        resetToForm();
        setCurrState("Login");
      } else if (result?.success) {
        setResendCooldown(60);
      }
    } finally {
      setIsResending(false);
    }
  };

  const autoFillDevOtp = () => {
    if (!effectiveOtp) return;
    const digits = effectiveOtp.split("");
    const next = [...otpInputs];
    for (let i = 0; i < 6; i++) next[i] = digits[i] || "";
    setOtpInputs(next);
  };

  if (verificationStep) {
    const otpComplete = otpInputs.every((d) => d !== "");

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

        <div className="relative z-10 w-full max-w-5xl flex items-center justify-center md:justify-around gap-8 lg:gap-16 max-md:flex-col my-auto">
          {/* Brand showcase for Laptop / Desktop */}
          <div className="hidden md:flex flex-col items-start gap-6 max-w-sm lg:max-w-md">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7c3aed] to-[#936eff] p-2.5 flex items-center justify-center shadow-xl shadow-purple-500/25 border border-purple-400/20">
                <img
                  src={assets.logo_icon}
                  alt="QuickChat"
                  className="w-full h-full object-contain drop-shadow"
                />
              </div>
              <div>
                <span className="text-3xl font-extrabold tracking-tight text-white block">
                  Quick<span className="text-[var(--accent)]">Chat</span>
                </span>
                <span className="text-xs font-medium text-[var(--accent)] tracking-wider uppercase">
                  Email Verification
                </span>
              </div>
            </div>

            <p className="text-base text-[var(--text-secondary)] leading-relaxed">
              Verify your email address to complete your account setup and unlock secure messaging.
            </p>
          </div>

          {/* Compact brand header for Mobile only */}
          <div className="flex items-center justify-center gap-2.5 md:hidden -mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#936eff] p-2 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <img src={assets.logo_icon} alt="QuickChat" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Quick<span className="text-[var(--accent)]">Chat</span>
            </span>
          </div>

          <form
            onSubmit={handleOtpSubmit}
            className="w-full max-w-[420px] rounded-3xl border border-white/10 bg-[#111b21]/95 backdrop-blur-2xl p-5 sm:p-8 flex flex-col gap-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]"
          >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Verify your email
            </h2>
            <button
              type="button"
              onClick={resetToForm}
              className="p-2 rounded-full hover:bg-[var(--bg-input)] text-[var(--text-secondary)] transition-colors"
              aria-label="Go back"
            >
              <img src={assets.arrow_icon} alt="" className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm text-[var(--text-secondary)]">
              We sent a 6-digit verification code to:
            </p>
            <p className="text-sm font-medium text-[var(--text-primary)] break-all">
              {effectiveEmail}
            </p>
          </div>

          <div className="flex justify-between gap-2 sm:gap-3 mt-1">
            {otpInputs.map((d, i) => (
              <input
                key={OTP_SLOTS[i]}
                id={`otp-${i}`}
                aria-label={`Digit ${i + 1} of verification code`}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={d}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="w-full aspect-square text-center text-xl font-semibold rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
                required
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={!otpComplete || isVerifying}
            className="mt-1 py-3 rounded-[var(--radius-md)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isVerifying ? "Verifying..." : "Verify & sign in"}
          </button>

          <div className="flex flex-col gap-3 items-center text-sm">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <span>Didn't get the code?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || resendCooldown > 0}
                className="font-medium text-[var(--accent)] hover:underline disabled:opacity-60 disabled:no-underline disabled:cursor-not-allowed"
              >
                {isResending
                  ? "Sending..."
                  : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend code"}
              </button>
            </div>

            {pendingVerificationInfo?.userFacingMailError && (
              <p className="text-xs text-amber-300/90 text-center leading-relaxed">
                {pendingVerificationInfo.userFacingMailError}
              </p>
            )}

            {!pendingVerificationInfo?.userFacingMailError &&
              pendingVerificationInfo?.mailError &&
              !emailDelivered && (
                <p className="text-xs text-amber-400/90 text-center">
                  {pendingVerificationInfo.mailError}
                </p>
              )}

            {showFallbackPanel && (
              <div
                className={`w-full rounded-[var(--radius-md)] border bg-[var(--bg-input)]/60 p-3 text-xs text-[var(--text-secondary)] space-y-3 ${
                  emailDelivered
                    ? "border-dashed border-[var(--border-default)]"
                    : "border-amber-500/40 bg-amber-500/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p
                    className={`font-medium ${
                      emailDelivered
                        ? "text-[var(--text-primary)]"
                        : "text-amber-300"
                    }`}
                  >
                    {emailDelivered
                      ? providerLabel
                        ? `🛡️ Email sent via ${providerLabel}`
                        : "🛡️ Email sent (check Spam folder)"
                      : "⚠️ Email not delivered — use direct verification below"}
                  </p>
                </div>

                {effectiveOtp && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[var(--text-secondary)]">
                        Your 6-digit code:{" "}
                        <span className="font-mono text-[var(--accent)] text-sm font-semibold tracking-widest">
                          {effectiveOtp}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={autoFillDevOtp}
                        className="px-2.5 py-1 rounded border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
                      >
                        Auto-fill
                      </button>
                    </div>
                  </div>
                )}

                {effectiveVerifyUrl && (
                  <div className="space-y-2 pt-1 border-t border-[var(--border-subtle)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="mb-1">Or click this link to verify directly:</p>
                        <Link
                          to={effectiveVerifyUrl}
                          className="block text-[var(--accent)] hover:underline break-all text-[0.7rem] leading-tight pr-2"
                        >
                          {effectiveVerifyUrl}
                        </Link>
                      </div>
                    </div>
                    <a
                      href={effectiveVerifyUrl}
                      className="block w-full text-center py-2 rounded-[var(--radius-md)] bg-[var(--accent)]/90 hover:bg-[var(--accent)] text-white text-[0.75rem] font-medium transition-colors"
                    >
                      Open verify page →
                    </a>
                  </div>
                )}

                {pendingVerificationInfo?.mailError &&
                  !pendingVerificationInfo?.userFacingMailError && (
                    <p className="pt-2 border-t border-[var(--border-subtle)] text-[0.7rem] text-[var(--text-secondary)]">
                      Debug: {pendingVerificationInfo.mailError}
                    </p>
                  )}
              </div>
            )}

            {!showFallbackPanel && !emailDelivered && providerLabel && (
              <p className="text-xs text-[var(--text-secondary)]">
                Tried sending via {providerLabel}. If nothing arrives in 2 minutes, click Resend.
              </p>
            )}
          </div>

          {emailDelivered && (
            <p className="text-xs text-[var(--text-secondary)] text-center -mt-1">
              💡 Check your Spam / Promotions folder and mark the message as Not Spam.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

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

      <div className="relative z-10 w-full max-w-5xl flex items-center justify-center md:justify-around gap-8 lg:gap-16 max-md:flex-col my-auto">
        {/* Brand showcase for Laptop / Desktop */}
        <div className="hidden md:flex flex-col items-start gap-6 max-w-sm lg:max-w-md">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7c3aed] to-[#936eff] p-2.5 flex items-center justify-center shadow-xl shadow-purple-500/25 border border-purple-400/20">
              <img
                src={assets.logo_icon}
                alt="QuickChat"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div>
              <span className="text-3xl font-extrabold tracking-tight text-white block">
                Quick<span className="text-[var(--accent)]">Chat</span>
              </span>
              <span className="text-xs font-medium text-[var(--accent)] tracking-wider uppercase">
                Modern Messaging
              </span>
            </div>
          </div>

          <p className="text-base text-[var(--text-secondary)] leading-relaxed">
            Connect with friends, family, and colleagues in real time. Private, instant, and secure messaging anywhere.
          </p>

          <div className="flex flex-col gap-3 w-full pt-1">
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Instant Messaging</p>
                <p className="text-xs text-[var(--text-muted)]">Real-time sync with typing indicators & read receipts</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <div className="w-9 h-9 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">HD Audio & Video Calls</p>
                <p className="text-xs text-[var(--text-muted)]">Direct 1-on-1 peer calls right inside your browser</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Private & Secure</p>
                <p className="text-xs text-[var(--text-muted)]">Protected credentials and end-to-end data privacy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compact brand header for Mobile only */}
        <div className="flex items-center justify-center gap-2.5 md:hidden -mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#936eff] p-2 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <img src={assets.logo_icon} alt="QuickChat" className="w-full h-full object-contain" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Quick<span className="text-[var(--accent)]">Chat</span>
          </span>
        </div>

        {/* Form Card */}
        <form
          onSubmit={onSubmitHandler}
          className="w-full max-w-[420px] rounded-3xl border border-white/10 bg-[#111b21]/95 backdrop-blur-2xl p-5 sm:p-8 flex flex-col gap-3.5 sm:gap-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]"
        >
          <div className="flex justify-between items-center pb-0.5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {currState === "Sign up" ? "Create account" : "Welcome back"}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {currState === "Sign up"
                  ? "Enter your details to get started"
                  : "Sign in to continue to QuickChat"}
              </p>
            </div>
            {isDataSubmitted && (
              <button
                type="button"
                onClick={() => setIsDataSubmitted(false)}
                className="p-2 rounded-full hover:bg-[var(--bg-input)] text-[var(--text-secondary)] transition-colors"
                aria-label="Go back"
              >
                <img src={assets.arrow_icon} alt="" className="w-5 h-5" />
              </button>
            )}
          </div>

          {isSignup && !isDataSubmitted && (
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                onChange={(e) => setFullName(e.target.value)}
                value={fullName}
                type="text"
                name="fullName"
                aria-label="Full Name"
                className="w-full bg-[#1e2a30]/80 border border-white/10 focus:border-[var(--accent)] focus:bg-[#202c33] focus:ring-2 focus:ring-[var(--accent-soft)] rounded-xl py-2.5 sm:py-3 pl-10 pr-4 text-sm text-white placeholder-[var(--text-muted)] transition-all outline-none"
                placeholder="Full Name"
                required
              />
            </div>
          )}

          {!isDataSubmitted && (
            <>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  type="email"
                  name="email"
                  aria-label="Email"
                  placeholder="Email address"
                  required
                  className="w-full bg-[#1e2a30]/80 border border-white/10 focus:border-[var(--accent)] focus:bg-[#202c33] focus:ring-2 focus:ring-[var(--accent-soft)] rounded-xl py-2.5 sm:py-3 pl-10 pr-4 text-sm text-white placeholder-[var(--text-muted)] transition-all outline-none"
                />
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  aria-label="Password"
                  placeholder="Password (min 6 chars)"
                  minLength={6}
                  required
                  className="w-full bg-[#1e2a30]/80 border border-white/10 focus:border-[var(--accent)] focus:bg-[#202c33] focus:ring-2 focus:ring-[var(--accent-soft)] rounded-xl py-2.5 sm:py-3 pl-10 pr-11 text-sm text-white placeholder-[var(--text-muted)] transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white p-1 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </>
          )}

          {isSignup && isDataSubmitted && (
            <textarea
              onChange={(e) => setBio(e.target.value)}
              value={bio}
              name="bio"
              aria-label="Bio"
              rows={3}
              className="w-full bg-[#1e2a30]/80 border border-white/10 focus:border-[var(--accent)] focus:bg-[#202c33] focus:ring-2 focus:ring-[var(--accent-soft)] rounded-xl p-3 text-sm text-white placeholder-[var(--text-muted)] transition-all outline-none resize-none"
              placeholder="A short bio about yourself..."
              required
            />
          )}

          {currState === "Login" && !isDataSubmitted && (
            <div className="flex justify-end -mt-1">
              <Link
                to="/forgot-password"
                className="text-xs text-[var(--accent)] hover:text-[#06cf9c] hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            className="mt-0.5 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-[#00a884] to-[#028e70] hover:from-[#02b992] hover:to-[#00a884] text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-950/40 active:scale-[0.98] cursor-pointer"
          >
            {isSignup ? "Create account" : "Log in"}
          </button>

          {!isDataSubmitted && <OAuthButtons />}

          {isSignup && (
            <div className="pt-0.5">
              <label className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    if (e.target.checked) setShowAgreementError(false);
                  }}
                  className="mt-0.5 rounded border-white/20 text-[var(--accent)] focus:ring-[var(--accent)] focus:ring-offset-0 bg-[#202c33] shrink-0"
                />
                <span>
                  I agree to the{" "}
                  <Link to="/terms" className="text-[var(--accent)] hover:underline font-medium">
                    Terms
                  </Link>
                  {" "}&{" "}
                  <Link to="/privacy" className="text-[var(--accent)] hover:underline font-medium">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {showAgreementError && !agreed && (
                <p className="text-xs text-red-400 mt-1">Please agree to the terms to continue.</p>
              )}
            </div>
          )}

          <div className="text-center pt-1 border-t border-white/5">
            <p className="text-xs text-[var(--text-secondary)]">
              {isSignup ? "Already have an account?" : "New to QuickChat?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setCurrState(isSignup ? "Login" : "Sign up");
                  setIsDataSubmitted(false);
                  setShowAgreementError(false);
                }}
                className="font-semibold text-[var(--accent)] hover:text-[#06cf9c] transition-colors hover:underline cursor-pointer ml-1"
              >
                {isSignup ? "Log in" : "Sign up"}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
