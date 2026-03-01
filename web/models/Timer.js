import mongoose from "mongoose";

const timerSchema = new mongoose.Schema(
  {
    shopDomain: {
      type: String,
      required: true,
      index: true,
    },
    timerName: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
    },
    timerSize: {
      type: String,
      enum: ["Small", "Medium", "Large"],
      default: "Medium",
    },
    timerPosition: {
      type: String,
      enum: ["Top", "Bottom", "Custom"],
      default: "Top",
    },
    urgencyNotification: {
      type: String,
      enum: ["None", "Color pulse"],
      default: "None",
    },
    color: {
      type: String,
      default: "#000000",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Timer", timerSchema);
