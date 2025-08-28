import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          // Either text or image should be present, but not necessarily both
          return v !== undefined || this.image !== undefined;
        },
        message: "Message must contain either text or image",
      },
    },
    image: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true; // image is optional
          return v.startsWith("http") || v.startsWith("data:image");
        },
        message: "Image must be a valid URL or base64 data URI",
      },
    },
    seen: {
      type: Boolean,
      default: false,
    },
    seenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, seen: 1 });
messageSchema.index({ createdAt: -1 });

// Virtual for checking if message has content
messageSchema.virtual("hasContent").get(function () {
  return !!this.text || !!this.image;
});

// Pre-save middleware to validate content
messageSchema.pre("save", function (next) {
  if (!this.text && !this.image) {
    return next(new Error("Message must contain either text or image"));
  }
  next();
});

// Method to mark as seen
messageSchema.methods.markAsSeen = function () {
  this.seen = true;
  this.seenAt = new Date();
  return this.save();
};

const Message = mongoose.model("Message", messageSchema);

export default Message;
