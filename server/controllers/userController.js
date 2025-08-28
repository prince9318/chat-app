import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// Signup a new user
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, bio } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !bio) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    // Generate token
    const token = generateToken(newUser._id);

    // Remove password from response
    const userResponse = { ...newUser.toObject() };
    delete userResponse.password;

    res.status(201).json({
      success: true,
      userData: userResponse,
      token,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Controller to login a user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(userData._id);

    // Remove password from response
    const userResponse = { ...userData.toObject() };
    delete userResponse.password;

    res.json({
      success: true,
      userData: userResponse,
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Controller to check if user is authenticated
export const checkAuth = (req, res) => {
  try {
    // Remove password from response
    const userResponse = { ...req.user.toObject() };
    delete userResponse.password;

    res.json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    console.error("Check auth error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Controller to update user profile details
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!fullName || !bio) {
      return res.status(400).json({
        success: false,
        message: "Full name and bio are required",
      });
    }

    let updateData = { bio, fullName };

    // Handle profile picture upload if provided
    if (profilePic) {
      // Validate if it's a base64 string or URL
      if (profilePic.startsWith("data:image")) {
        const upload = await cloudinary.uploader.upload(profilePic, {
          folder: "user-profiles",
          transformation: [
            { width: 500, height: 500, crop: "limit" },
            { quality: "auto" },
          ],
        });
        updateData.profilePic = upload.secure_url;
      } else {
        // Assume it's already a URL
        updateData.profilePic = profilePic;
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password"); // Exclude password from response

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
