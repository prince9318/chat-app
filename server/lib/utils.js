import jwt from "jsonwebtoken";

// Function to generate a token for a user
export const generateToken = (userId) => {
  try {
    // Validate input
    if (!userId) {
      throw new Error("User ID is required to generate token");
    }

    // Validate JWT secret exists
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not defined");
    }

    // Generate token with expiration and other options
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d", // Default to 7 days
      issuer: process.env.JWT_ISSUER || "your-app-name",
      audience: process.env.JWT_AUDIENCE || "your-app-users",
    });

    return token;
  } catch (error) {
    console.error("❌ Token generation failed:", error.message);
    throw new Error(`Failed to generate token: ${error.message}`);
  }
};

// Simplified version if you prefer minimal changes:

// import jwt from "jsonwebtoken";

// Function to generate a token for a user
// export const generateToken = (userId) => {
//   // Basic validation
//   if (!userId) throw new Error("User ID is required");
//   if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");

//   const token = jwt.sign(
//     { userId },
//     process.env.JWT_SECRET,
//     { expiresIn: '7d' } // Always set an expiration
//   );

//   return token;
// }
