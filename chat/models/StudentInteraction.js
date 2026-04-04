const mongoose = require("mongoose");

const studentInteractionSchema = new mongoose.Schema(
  {
    message: { type: String, required: true, trim: true },
    emotion: { type: String, default: "neutral", trim: true },
    webcam_emotion: { type: String, default: "", trim: true },
    intent: {
      type: String,
      enum: ["RISK_DROPOUT", "PASSION_SHIFT", "STUDY_DOUBT", "NORMAL"],
      default: "NORMAL"
    },
    risk_level: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], default: "LOW" },
    confidence: { type: Number, min: 0, max: 100, default: 50 },
    reason: { type: String, default: "" },
    recommended_action: { type: String, default: "" },
    response_message: { type: String, default: "I'm here to help. Can you tell me more?" }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

studentInteractionSchema.index({ createdAt: -1 });
studentInteractionSchema.index({ risk_level: 1 });
studentInteractionSchema.index({ intent: 1 });

module.exports = mongoose.model("StudentInteraction", studentInteractionSchema);
