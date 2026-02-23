import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";

const LoginPage = () => {
  // ✅ State for handling form flow and inputs
  const [currState, setCurrState] = useState("Sign up"); // Tracks current form type ("Sign up" or "Login")
  const [fullName, setFullName] = useState(""); // User's full name (signup only)
  const [email, setEmail] = useState(""); // User's email
  const [password, setPassword] = useState(""); // User's password
  const [bio, setBio] = useState(""); // User's bio (signup step 2)
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showAgreementError, setShowAgreementError] = useState(false);

  // ✅ Context: Authentication handler
  const { login } = useContext(AuthContext);

  // ✅ Handle form submission
  const onSubmitHandler = (event) => {
    event.preventDefault();

    if (!agreed) {
      setShowAgreementError(true);
      return;
    }

    // Step 1 of signup: first submit only asks for basic info → move to bio step
    if (currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    // Step 2 of signup OR login: send data to AuthContext
    login(currState === "Sign up" ? "signup" : "login", {
      fullName,
      email,
      password,
      bio,
      agreedToTerms: agreed,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center gap-10 sm:justify-evenly max-sm:flex-col p-4 sm:p-6 relative overflow-hidden">
      {/* Background: gradient + subtle grid */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-app)] via-[#0d1318] to-[#0a1628]" />
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, var(--border-default) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Left: Logo */}
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

      {/* Right: Form card */}
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

        {currState === "Sign up" && !isDataSubmitted && (
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
              placeholder="Password"
              required
              className="input-field"
            />
          </>
        )}

        {currState === "Sign up" && isDataSubmitted && (
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
          {currState === "Sign up" ? "Create account" : "Log in"}
        </button>

        <label className="flex items-start gap-3 text-sm text-[var(--text-secondary)] cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 rounded border-[var(--border-default)] text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          <span>
            I agree to the{" "}
            <Link to="/terms" className="text-[var(--accent)] hover:underline">Terms</Link>
            {" "}&{" "}
            <Link to="/privacy" className="text-[var(--accent)] hover:underline">Privacy</Link>.
          </span>
        </label>
        {showAgreementError && !agreed && (
          <p className="text-xs text-red-400 -mt-2">Please agree to continue.</p>
        )}

        <p className="text-sm text-[var(--text-secondary)] text-center pt-1">
          {currState === "Sign up" ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false);
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
                onClick={() => setCurrState("Sign up")}
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
