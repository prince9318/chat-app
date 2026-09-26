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
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showAgreementError, setShowAgreementError] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
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
  const isDev = import.meta.env.DEV;

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
    await verifyEmail({ email: effectiveEmail, otp });
    setIsVerifying(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    const result = await resendVerificationEmail(effectiveEmail);
    if (result?.alreadyVerified) {
      resetToForm();
      setCurrState("Login");
    } else if (result?.success) {
      setResendCooldown(60);
    }
    setIsResending(false);
  };

  const autoFillDevOtp = () => {
    if (!pendingVerificationInfo?.devOtp) return;
    const digits = pendingVerificationInfo.devOtp.split("");
    const next = [...otpInputs];
    for (let i = 0; i < 6; i++) next[i] = digits[i] || "";
    setOtpInputs(next);
  };

  if (verificationStep) {
    const otpComplete = otpInputs.every((d) => d !== "");

    return (
      <div className="min-h-screen flex items-center justify-center gap-10 sm:justify-evenly max-sm:flex-col p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-app)] via-[#0d1318] to-[#0a1628]" />
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, var(--border-default) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <img
            src={assets.logo_big}
            alt="App Logo"
            className="w-[min(100vw,260px)] drop-shadow-2xl"
          />
          <p className="text-[var(--text-secondary)] text-sm max-w-[200px] text-center hidden sm:block">
            Chat with anyone, anywhere. Simple and private.
          </p>
        </div>

        <form
          onSubmit={handleOtpSubmit}
          className="relative z-10 w-[min(95vw,420px)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-[var(--bg-panel)]/95 backdrop-blur-xl p-7 sm:p-8 flex flex-col gap-5 shadow-[var(--shadow-card)]"
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
                key={i}
                id={`otp-${i}`}
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

            {pendingVerificationInfo?.mailError && (
              <p className="text-xs text-amber-400/90 text-center">
                {pendingVerificationInfo.mailError}
              </p>
            )}

            {isDev &&
              (pendingVerificationInfo?.devOtp ||
                pendingVerificationInfo?.devVerifyUrl) && (
                <div className="w-full rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] bg-[var(--bg-input)]/50 p-3 text-xs text-[var(--text-secondary)] space-y-2">
                  <p className="font-medium text-[var(--text-primary)]">
                    🧪 Dev Mode
                  </p>
                  {pendingVerificationInfo.devOtp && (
                    <div className="flex items-center justify-between gap-3">
                      <span>
                        OTP:{" "}
                        <span className="font-mono text-[var(--accent)]">
                          {pendingVerificationInfo.devOtp}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={autoFillDevOtp}
                        className="px-2 py-1 rounded border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}
                  {pendingVerificationInfo.devVerifyUrl && (
                    <div className="break-all">
                      Link:{" "}
                      <Link
                        to={pendingVerificationInfo.devVerifyUrl}
                        className="text-[var(--accent)] hover:underline"
                      >
                        Open verify page
                      </Link>
                    </div>
                  )}
                </div>
              )}
          </div>

          <p className="text-xs text-[var(--text-secondary)] text-center -mt-1">
            Or click the verification link sent in the email.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center gap-10 sm:justify-evenly max-sm:flex-col p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-app)] via-[#0d1318] to-[#0a1628]" />
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, var(--border-default) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-4">
        <img
          src={assets.logo_big}
          alt="App Logo"
          className="w-[min(100vw,260px)] drop-shadow-2xl"
        />
        <p className="text-[var(--text-secondary)] text-sm max-w-[200px] text-center hidden sm:block">
          Chat with anyone, anywhere. Simple and private.
        </p>
      </div>

      <form
        onSubmit={onSubmitHandler}
        className="relative z-10 w-[min(95vw,400px)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-[var(--bg-panel)]/95 backdrop-blur-xl p-7 sm:p-8 flex flex-col gap-5 shadow-[var(--shadow-card)]"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {currState}
          </h2>
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
          <input
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            type="text"
            className="input-field"
            placeholder="Full Name"
            required
          />
        )}

        {!isDataSubmitted && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email"
              required
              className="input-field"
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password (min 6 chars)"
              minLength={6}
              required
              className="input-field"
            />
          </>
        )}

        {isSignup && isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            rows={4}
            className="input-field resize-none"
            placeholder="A short bio..."
            required
          />
        )}

        <button
          type="submit"
          className="mt-1 py-3 rounded-[var(--radius-md)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSignup ? "Create account" : "Log in"}
        </button>

        {!isDataSubmitted && <OAuthButtons />}

        {currState === "Login" && !isDataSubmitted && (
          <div className="-mt-2 text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-[var(--accent)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        )}

        {isSignup && (
          <>
            <label className="flex items-start gap-3 text-sm text-[var(--text-secondary)] cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  if (e.target.checked) {
                    setShowAgreementError(false);
                  }
                }}
                className="mt-0.5 rounded border-[var(--border-default)] text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <span>
                I agree to the{" "}
                <Link to="/terms" className="text-[var(--accent)] hover:underline">
                  Terms
                </Link>
                {" "}&{" "}
                <Link to="/privacy" className="text-[var(--accent)] hover:underline">
                  Privacy
                </Link>
                .
              </span>
            </label>
            {showAgreementError && !agreed && (
              <p className="text-xs text-red-400 -mt-2">Please agree to continue.</p>
            )}
          </>
        )}

        <p className="text-sm text-[var(--text-secondary)] text-center pt-1">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false);
                  setShowAgreementError(false);
                }}
                className="font-medium text-[var(--accent)] hover:underline"
              >
                Log in
              </button>
            </>
          ) : (
            <>
              New here?{" "}
              <button
                type="button"
                onClick={() => {
                  setCurrState("Sign up");
                  setShowAgreementError(false);
                }}
                className="font-medium text-[var(--accent)] hover:underline"
              >
                Sign up
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
