import { useContext, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";

const LoginPage = () => {
  // ✅ State for handling form flow and inputs
  const [currState, setCurrState] = useState("Sign up"); // Tracks current form type ("Sign up" or "Login")
  const [fullName, setFullName] = useState(""); // User's full name (signup only)
  const [email, setEmail] = useState(""); // User's email
  const [password, setPassword] = useState(""); // User's password
  const [bio, setBio] = useState(""); // User's bio (signup step 2)
  const [isDataSubmitted, setIsDataSubmitted] = useState(false); // Tracks step within signup

  // ✅ Context: Authentication handler
  const { login } = useContext(AuthContext);

  // ✅ Handle form submission
  const onSubmitHandler = (event) => {
    event.preventDefault();

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
        className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg"
      >
        {/* -------- Form Heading (Sign up / Login) -------- */}
        <h2 className="font-medium text-2xl flex justify-between items-center text-white">
          {currState}
          {isDataSubmitted && (
            <img
              onClick={() => setIsDataSubmitted(false)} // Back button for signup step
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
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              required
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </>
        )}

        {/* -------- Signup Step 2: Bio -------- */}
        {currState === "Sign up" && isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            rows={4}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
            placeholder="Provide a short bio..."
            required
          ></textarea>
        )}

        {/* -------- Submit Button -------- */}
        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer"
        >
          {currState === "Sign up" ? "Create Account" : "Login Now"}
        </button>

        {/* -------- Terms & Policy Checkbox -------- */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>

        {/* -------- Toggle Between Login & Signup -------- */}
        <div className="flex flex-col gap-2">
          {currState === "Sign up" ? (
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false); // Reset to first step
                }}
                className="font-medium text-violet-500 cursor-pointer"
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Create an account{" "}
              <span
                onClick={() => setCurrState("Sign up")}
                className="font-medium text-violet-500 cursor-pointer"
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
