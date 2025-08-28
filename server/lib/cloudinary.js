import { v2 as cloudinary } from "cloudinary";

let isCloudinaryConfigured = false;

const configureCloudinary = () => {
  const requiredEnvVars = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `⚠️ Cloudinary not configured. Missing: ${missingVars.join(", ")}`
    );
    return false;
  }

  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // console.log("✅ Cloudinary configured successfully");
    return true;
  } catch (error) {
    console.error("❌ Cloudinary configuration error:", error.message);
    return false;
  }
};

isCloudinaryConfigured = configureCloudinary();

// Export both cloudinary and configuration status
export { isCloudinaryConfigured };
export default cloudinary;
