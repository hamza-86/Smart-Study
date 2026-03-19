const mongoose = require("mongoose");

// One document per user+video session — updated on each watch
const watchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subSection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    watchedSeconds: {
      // how many seconds watched total
      type: Number,
      default: 0,
    },
    totalSeconds: {
      // full video length in seconds
      type: Number,
      default: 0,
    },
    lastPosition: {
      // resume from here (seconds)
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    watchCount: {
      // number of times video was opened
      type: Number,
      default: 1,
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

watchHistorySchema.index({ user: 1, subSection: 1 }, { unique: true });

module.exports = mongoose.model("WatchHistory", watchHistorySchema);