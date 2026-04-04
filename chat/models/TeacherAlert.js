const mongoose = require("mongoose");

const teacherAlertSchema = new mongoose.Schema(
  {
    interaction_id: { type: mongoose.Schema.Types.ObjectId, ref: "StudentInteraction" },
    message: { type: String, required: true, trim: true },
    risk_level: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], required: true },
    risk_percentage: { type: Number, min: 0, max: 100, required: true },
    threshold_triggered: { type: Number, min: 0, max: 100, required: true },
    emotion: { type: String, default: "neutral", trim: true },
    webcam_emotion: { type: String, default: "", trim: true },
    reason: { type: String, default: "" },
    status: { type: String, enum: ["NEW", "ACKNOWLEDGED"], default: "NEW" }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

teacherAlertSchema.index({ createdAt: -1 });
teacherAlertSchema.index({ status: 1, createdAt: -1 });
teacherAlertSchema.index({ risk_percentage: -1 });

module.exports = mongoose.model("TeacherAlert", teacherAlertSchema);
