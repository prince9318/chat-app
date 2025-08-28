import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // This creates an index automatically
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters long"],
      maxlength: [50, "Full name cannot exceed 50 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    profilePic: {
      type: String,
      default: "",
      validate: {
        validator: function (v) {
          if (!v) return true;
          return v.startsWith("http") || v.startsWith("data:image");
        },
        message: "Profile picture must be a valid URL or base64 data URI",
      },
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Remove the duplicate index definition if you have this:
// userSchema.index({ email: 1 }); // ❌ REMOVE THIS LINE

// Only keep indexes that are NOT already defined in the field definitions
userSchema.index({ fullName: "text" });
userSchema.index({ isOnline: 1, lastSeen: -1 });

// Virtual for user's display name
userSchema.virtual("displayName").get(function () {
  return this.fullName || this.email.split("@")[0];
});

// Method to update last seen timestamp
userSchema.methods.updateLastSeen = function () {
  this.lastSeen = new Date();
  return this.save();
};

// Static method to find by email (case insensitive)
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

const User = mongoose.model("User", userSchema);

export default User;
