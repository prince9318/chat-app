import mongoose from "mongoose";

// Function to connect to the MongoDB database
export const connectDB = async () => {
  try {
    // Set up event listeners before connecting
    mongoose.connection.on("connected", () => {
      console.log("Database connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Database connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Database disconnected");
    });

    // Connect to MongoDB with options
    await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);

    // console.log("Connecting to database...");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1); // Exit process with failure
  }
};
