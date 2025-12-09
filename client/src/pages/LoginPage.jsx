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
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      {/* -------- Left Section: App Logo -------- */}
      <img
        src={assets.logo_big}
        alt="App Logo"
        className="w-[min(100vw,250px)]"
      />

      {/* -------- Right Section: Login / Signup Form -------- */}
      <form
        onSubmit={onSubmitHandler}
        className="border-2 bg-white/10 text-white border-gray-600 p-6 flex flex-col gap-6 rounded-xl shadow-2xl backdrop-blur-md w-[min(95vw,380px)]"
      >
        {/* -------- Form Heading (Sign up / Login) -------- */}
        <h2 className="font-medium text-2xl flex justify-between items-center text-white">
          {currState}
          {isDataSubmitted && (
            <img
              onClick={() => setIsDataSubmitted(false)}
              src={assets.arrow_icon}
              alt="Go Back"
              className="w-5 cursor-pointer"
            />
          )}
        </h2>

        {/* -------- Signup Step 1: Full Name -------- */}
        {currState === "Sign up" && !isDataSubmitted && (
          <input
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            type="text"
            className="p-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-800/50 text-white placeholder-gray-400"
            placeholder="Full Name"
            required
          />
        )}

        {/* -------- Email & Password (Both Login + Signup Step 1) -------- */}
        {!isDataSubmitted && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email Address"
              required
              className="p-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-800/50 text-white placeholder-gray-400"
            />

            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              required
              className="p-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-800/50 text-white placeholder-gray-400"
            />
          </>
        )}

        {/* -------- Signup Step 2: Bio -------- */}
        {currState === "Sign up" && isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            rows={4}
            className="p-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-800/50 text-white placeholder-gray-400"
            placeholder="Provide a short bio..."
            required
          ></textarea>
        )}

        {/* -------- Submit Button -------- */}
        <button
          type="submit"
          className={`py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg shadow-lg transition-all ${
            !agreed ? "opacity-90" : "hover:from-purple-600 hover:to-violet-700"
          }`}
        >
          {currState === "Sign up" ? "Create Account" : "Login Now"}
        </button>

        <div className="flex items-start gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1"
          />
          <p>
            I agree to the
            {" "}
            <Link to="/terms" className="text-violet-400 hover:text-violet-300">terms of use</Link>
            {" "}&
            {" "}
            <Link to="/privacy" className="text-violet-400 hover:text-violet-300">privacy policy</Link>.
          </p>
        </div>
        {showAgreementError && !agreed && (
          <p className="text-xs text-red-400">Please agree to continue.</p>
        )}

        {/* -------- Toggle Between Login & Signup -------- */}
        <div className="flex flex-col gap-2">
          {currState === "Sign up" ? (
            <p className="text-sm text-gray-300">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false);
                }}
                className="font-medium text-violet-400 cursor-pointer hover:text-violet-300"
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-300">
              Create an account{" "}
              <span
                onClick={() => setCurrState("Sign up")}
                className="font-medium text-violet-400 cursor-pointer hover:text-violet-300"
              >
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
