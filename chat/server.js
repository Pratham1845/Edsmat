require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { HfInference } = require("@huggingface/inference");
const { cleanAndParseJSON, FALLBACK_RESPONSE } = require("./utils/cleanAndParseJSON");
const StudentInteraction = require("./models/StudentInteraction");
const TeacherAlert = require("./models/TeacherAlert");

const PORT = process.env.PORT || 5502;
const MONGO_URI = process.env.MONGO_URI;

const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = "SamLowe/roberta-base-go_emotions";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash-lite";
const SADNESS_ALERT_THRESHOLD = 3;

const RISK_HIGH_THRESHOLD = Number(process.env.RISK_HIGH_THRESHOLD || 70);
const RISK_MEDIUM_THRESHOLD = Number(process.env.RISK_MEDIUM_THRESHOLD || 40);
const TEACHER_ALERT_THRESHOLD = Number(
  process.env.TEACHER_ALERT_THRESHOLD || process.env.RISK_ALERT_THRESHOLD || 75
);

const DEFAULT_REPLY = "I'm here to help. Can you tell me more?";

const app = express();
const hfClient = HF_TOKEN ? new HfInference(HF_TOKEN) : null;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

console.log("GEMINI KEY:", GEMINI_API_KEY ? "Loaded" : "Missing");
console.log("HF TOKEN:", HF_TOKEN ? "Loaded" : "Missing");
console.log("RISK THRESHOLDS:", {
  high: RISK_HIGH_THRESHOLD,
  medium: RISK_MEDIUM_THRESHOLD,
  teacherAlert: TEACHER_ALERT_THRESHOLD
});

let sadnessStreak = 0;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173").split(",");
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.error("MongoDB connection error:", error.message));
} else {
  console.warn("MONGO_URI missing. Data will not persist to MongoDB.");
}

const requestMap = new Map();
const RATE_LIMIT = 20;
const WINDOW_MS = 60 * 1000;

function isRateLimited(ip) {
  const now = Date.now();

  if (!requestMap.has(ip)) {
    requestMap.set(ip, []);
  }

  const timestamps = requestMap.get(ip).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  requestMap.set(ip, timestamps);

  return timestamps.length > RATE_LIMIT;
}

function isDbReady() {
  return mongoose.connection.readyState === 1;
}

function normalizeIntent(value) {
  const allowed = ["RISK_DROPOUT", "PASSION_SHIFT", "STUDY_DOUBT", "NORMAL"];
  const normalized = (value || "NORMAL").toString().toUpperCase();
  return allowed.includes(normalized) ? normalized : "NORMAL";
}

function normalizeRisk(value) {
  const allowed = ["HIGH", "MEDIUM", "LOW"];
  const normalized = (value || "LOW").toString().toUpperCase();
  return allowed.includes(normalized) ? normalized : "LOW";
}

function normalizeConfidence(value) {
  const confidenceNumber = Number(value);
  if (!Number.isFinite(confidenceNumber)) {
    return 50;
  }
  return Math.max(0, Math.min(100, confidenceNumber));
}

function normalizeWebcamEmotion(value) {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === "unknown" || normalized === "none" || normalized === "off") {
    return "";
  }

  return normalized.slice(0, 40);
}

function normalizePercentage(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(0, Math.min(100, Number(parsed.toFixed(2))));
}

function riskLevelToPercentage(level) {
  const normalized = normalizeRisk(level);
  if (normalized === "HIGH") {
    return Math.max(RISK_HIGH_THRESHOLD, 80);
  }
  if (normalized === "MEDIUM") {
    return Math.max(RISK_MEDIUM_THRESHOLD, 55);
  }
  return Math.min(RISK_MEDIUM_THRESHOLD - 1, 25);
}

function getRiskLevelByPercentage(percentage) {
  const value = normalizePercentage(percentage);

  if (value >= RISK_HIGH_THRESHOLD) {
    return "HIGH";
  }
  if (value >= RISK_MEDIUM_THRESHOLD) {
    return "MEDIUM";
  }
  return "LOW";
}

function deriveRiskPercentage(parsedRiskPercentage, parsedRiskLevel) {
  if (parsedRiskPercentage !== undefined && parsedRiskPercentage !== null && parsedRiskPercentage !== "") {
    return normalizePercentage(parsedRiskPercentage, 0);
  }
  return normalizePercentage(riskLevelToPercentage(parsedRiskLevel), 0);
}

app.post("/chat", async (req, res) => {
  const ip = req.ip;

  if (isRateLimited(ip)) {
    return res.status(429).json({
      success: false,
      error: "Too many requests. Slow down."
    });
  }

  let { message, emotion, webcam_emotion } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      success: false,
      error: "Message is required."
    });
  }

  message = message.trim().slice(0, 500);

  try {
    const externalEmotion =
      typeof emotion === "string" && emotion.trim()
        ? emotion.trim().toLowerCase()
        : await detectEmotion(message);

    const webcamEmotion = normalizeWebcamEmotion(webcam_emotion);

    const rawGeminiText = await getGeminiRawResponse(message, externalEmotion, webcamEmotion);
    const parsed = cleanAndParseJSON(rawGeminiText);

    const riskPercentage = deriveRiskPercentage(parsed.risk_percentage, parsed.risk_level);
    const riskLevel = getRiskLevelByPercentage(riskPercentage);
    const thresholdCrossed = riskPercentage >= normalizePercentage(TEACHER_ALERT_THRESHOLD, 75);

    const finalData = {
      message,
      emotion: externalEmotion || parsed.emotion || "neutral",
      webcam_emotion: webcamEmotion,
      intent: normalizeIntent(parsed.intent),
      risk_level: riskLevel,
      risk_percentage: riskPercentage,
      teacher_alert_sent: thresholdCrossed,
      confidence: normalizeConfidence(parsed.confidence),
      reason: (parsed.reason || "").toString(),
      recommended_action: (parsed.recommended_action || "").toString(),
      response_message: appendSadnessAlert(
        externalEmotion || "neutral",
        webcamEmotion,
        (parsed.response_message || DEFAULT_REPLY).toString()
      )
    };

    let createdAt = new Date().toISOString();
    let interactionId = null;

    if (isDbReady()) {
      try {
        const saved = await StudentInteraction.create(finalData);
        createdAt = saved.createdAt;
        interactionId = saved._id;

        if (thresholdCrossed) {
          await TeacherAlert.create({
            interaction_id: saved._id,
            message,
            risk_level: riskLevel,
            risk_percentage: riskPercentage,
            threshold_triggered: normalizePercentage(TEACHER_ALERT_THRESHOLD, 75),
            emotion: finalData.emotion,
            webcam_emotion: webcamEmotion,
            reason: finalData.reason
          });
        }
      } catch (dbError) {
        console.error("Mongo save error:", dbError.message);
      }
    }

    return res.json({
      success: true,
      data: {
        interaction_id: interactionId,
        message: finalData.message,
        emotion: finalData.emotion,
        webcam_emotion: finalData.webcam_emotion,
        intent: finalData.intent,
        risk_level: finalData.risk_level,
        risk_percentage: finalData.risk_percentage,
        teacher_alert_sent: finalData.teacher_alert_sent,
        risk_thresholds: {
          high: RISK_HIGH_THRESHOLD,
          medium: RISK_MEDIUM_THRESHOLD,
          teacher_alert: normalizePercentage(TEACHER_ALERT_THRESHOLD, 75)
        },
        confidence: finalData.confidence,
        response_message: finalData.response_message,
        recommended_action: finalData.recommended_action,
        createdAt
      }
    });
  } catch (error) {
    console.error("Pipeline error:", error.message);

    const fallbackRiskPercentage = deriveRiskPercentage(
      FALLBACK_RESPONSE.risk_percentage,
      FALLBACK_RESPONSE.risk_level
    );

    return res.json({
      success: true,
      data: {
        message,
        emotion: "neutral",
        webcam_emotion: "",
        intent: FALLBACK_RESPONSE.intent,
        risk_level: getRiskLevelByPercentage(fallbackRiskPercentage),
        risk_percentage: fallbackRiskPercentage,
        teacher_alert_sent: false,
        risk_thresholds: {
          high: RISK_HIGH_THRESHOLD,
          medium: RISK_MEDIUM_THRESHOLD,
          teacher_alert: normalizePercentage(TEACHER_ALERT_THRESHOLD, 75)
        },
        confidence: FALLBACK_RESPONSE.confidence,
        response_message: FALLBACK_RESPONSE.response_message,
        recommended_action: FALLBACK_RESPONSE.recommended_action,
        createdAt: new Date().toISOString()
      }
    });
  }
});

app.get("/api/dashboard", async (_req, res) => {
  try {
    if (!isDbReady()) {
      return res.json({
        success: true,
        data: {
          totalInteractions: 0,
          riskCounts: { HIGH: 0, MEDIUM: 0, LOW: 0 },
          avgConfidence: 0,
          avgRiskPercentage: 0,
          alertCounts: { NEW: 0, ACKNOWLEDGED: 0, TOTAL: 0 },
          riskThresholds: {
            high: RISK_HIGH_THRESHOLD,
            medium: RISK_MEDIUM_THRESHOLD,
            teacher_alert: normalizePercentage(TEACHER_ALERT_THRESHOLD, 75)
          },
          riskDistribution: [
            { risk_level: "HIGH", count: 0 },
            { risk_level: "MEDIUM", count: 0 },
            { risk_level: "LOW", count: 0 }
          ],
          intentDistribution: []
        }
      });
    }

    const [totalInteractions, riskCountsRaw, intentCountsRaw, avgConfidenceRaw, avgRiskRaw, alertCountsRaw] =
      await Promise.all([
        StudentInteraction.countDocuments(),
        StudentInteraction.aggregate([{ $group: { _id: "$risk_level", count: { $sum: 1 } } }]),
        StudentInteraction.aggregate([{ $group: { _id: "$intent", count: { $sum: 1 } } }]),
        StudentInteraction.aggregate([{ $group: { _id: null, avgConfidence: { $avg: "$confidence" } } }]),
        StudentInteraction.aggregate([
          { $group: { _id: null, avgRiskPercentage: { $avg: "$risk_percentage" } } }
        ]),
        TeacherAlert.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
      ]);

    const riskCounts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    riskCountsRaw.forEach((item) => {
      if (item?._id && riskCounts[item._id] !== undefined) {
        riskCounts[item._id] = item.count;
      }
    });

    const alertCounts = { NEW: 0, ACKNOWLEDGED: 0, TOTAL: 0 };
    alertCountsRaw.forEach((item) => {
      if (item?._id && alertCounts[item._id] !== undefined) {
        alertCounts[item._id] = item.count;
      }
    });
    alertCounts.TOTAL = alertCounts.NEW + alertCounts.ACKNOWLEDGED;

    const intentDistribution = intentCountsRaw.map((item) => ({
      intent: item._id || "UNKNOWN",
      count: item.count
    }));

    return res.json({
      success: true,
      data: {
        totalInteractions,
        riskCounts,
        avgConfidence: Number((avgConfidenceRaw?.[0]?.avgConfidence || 0).toFixed(2)),
        avgRiskPercentage: Number((avgRiskRaw?.[0]?.avgRiskPercentage || 0).toFixed(2)),
        alertCounts,
        riskThresholds: {
          high: RISK_HIGH_THRESHOLD,
          medium: RISK_MEDIUM_THRESHOLD,
          teacher_alert: normalizePercentage(TEACHER_ALERT_THRESHOLD, 75)
        },
        riskDistribution: [
          { risk_level: "HIGH", count: riskCounts.HIGH },
          { risk_level: "MEDIUM", count: riskCounts.MEDIUM },
          { risk_level: "LOW", count: riskCounts.LOW }
        ],
        intentDistribution
      }
    });
  } catch (error) {
    console.error("Dashboard error:", error.message);
    return res.status(500).json({ success: false, error: "Failed to load dashboard data." });
  }
});

app.get("/api/history", async (_req, res) => {
  try {
    if (!isDbReady()) {
      return res.json({ success: true, data: [] });
    }

    const history = await StudentInteraction.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .select(
        "message response_message risk_level risk_percentage teacher_alert_sent confidence intent createdAt"
      );

    return res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error("History error:", error.message);
    return res.status(500).json({ success: false, error: "Failed to load history." });
  }
});

app.get("/api/teacher-alerts", async (_req, res) => {
  try {
    if (!isDbReady()) {
      return res.json({ success: true, data: [] });
    }

    const alerts = await TeacherAlert.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .select(
        "message risk_level risk_percentage threshold_triggered emotion webcam_emotion reason status createdAt"
      );

    return res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error("Teacher alerts error:", error.message);
    return res.status(500).json({ success: false, error: "Failed to load teacher alerts." });
  }
});

async function detectEmotion(text, attempt = 0) {
  if (!hfClient) {
    return "neutral";
  }

  try {
    const results = await hfClient.textClassification({
      model: HF_MODEL,
      inputs: text,
      options: { wait_for_model: true }
    });

    const predictions = Array.isArray(results?.[0]) ? results[0] : results;

    if (!Array.isArray(predictions) || !predictions.length) {
      throw new Error("No predictions");
    }

    const sorted = predictions.sort((a, b) => b.score - a.score);
    return sorted[0]?.label || "neutral";
  } catch (error) {
    console.error(`HF error (attempt ${attempt + 1}):`, error.message);

    if (attempt < 1) {
      await wait(800);
      return detectEmotion(text, attempt + 1);
    }

    return "neutral";
  }
}

async function getGeminiRawResponse(message, emotion, webcamEmotion) {
  if (!genAI) {
    return JSON.stringify(generateLocalStructuredReply(message, emotion, webcamEmotion));
  }

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = buildPrompt(message, emotion, webcamEmotion);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Empty Gemini response");
    }

    return text.trim();
  } catch (error) {
    console.error("Gemini error:", error.message);
    return JSON.stringify(generateLocalStructuredReply(message, emotion, webcamEmotion));
  }
}

function generateLocalStructuredReply(message, textEmotion, webcamEmotion) {
  const msg = message.toLowerCase();
  const emotionSignal = (webcamEmotion || textEmotion || "neutral").toLowerCase();

  if (
    emotionSignal.includes("sad") ||
    emotionSignal.includes("stress") ||
    emotionSignal.includes("anxious") ||
    emotionSignal.includes("fear") ||
    emotionSignal.includes("angry")
  ) {
    return {
      intent: "RISK_DROPOUT",
      emotion: textEmotion,
      risk_level: "HIGH",
      risk_percentage: 82,
      confidence: 78,
      reason: "Detected emotional distress from text and/or webcam signal.",
      recommended_action: "Encourage support from mentor and create a short recovery plan.",
      response_message:
        "I hear you. Let us take this one step at a time and build a small plan you can follow today."
    };
  }

  if (msg.includes("exam") || msg.includes("study") || msg.includes("math")) {
    return {
      intent: "STUDY_DOUBT",
      emotion: textEmotion,
      risk_level: "LOW",
      risk_percentage: 28,
      confidence: 82,
      reason: "Student is asking an academic question.",
      recommended_action: "Provide concise study guidance and a small action plan.",
      response_message:
        "Try active recall plus 25-minute focused study blocks. If you want, I can build a quick plan for your next exam."
    };
  }

  return {
    intent: "NORMAL",
    emotion: textEmotion,
    risk_level: "LOW",
    risk_percentage: 20,
    confidence: 60,
    reason: "General conversational message.",
    recommended_action: "Continue with supportive conversation.",
    response_message: DEFAULT_REPLY
  };
}

function buildPrompt(message, emotion, webcamEmotion) {
  const webcamLine = webcamEmotion ? `Webcam emotion: "${webcamEmotion}"` : "";

  return `You are an AI student support assistant.

Return ONLY valid JSON and no extra text.
Do not include markdown fences.

Schema:
{
  "intent": "",
  "emotion": "",
  "risk_level": "",
  "risk_percentage": "",
  "confidence": "",
  "reason": "",
  "recommended_action": "",
  "response_message": ""
}

Rules:
- intent must be one of: RISK_DROPOUT, PASSION_SHIFT, STUDY_DOUBT, NORMAL
- risk_level must be one of: HIGH, MEDIUM, LOW
- risk_percentage must be a number from 0 to 100
- confidence must be a number between 0 and 100
- Keep response_message short and empathetic
- emotion should reflect Hugging Face text emotion unless a stronger signal exists
- Combine both signals for risk analysis when webcam emotion is present
- If both text emotion and webcam emotion indicate distress, raise risk appropriately
- Keep risk_level aligned with risk_percentage thresholds:
  HIGH if risk_percentage >= ${RISK_HIGH_THRESHOLD}
  MEDIUM if risk_percentage >= ${RISK_MEDIUM_THRESHOLD} and < ${RISK_HIGH_THRESHOLD}
  LOW if risk_percentage < ${RISK_MEDIUM_THRESHOLD}

Input message: "${message}"
Hugging Face text emotion: "${emotion}"
${webcamLine}`;
}

function appendSadnessAlert(textEmotion, webcamEmotion, responseMessage) {
  const safeMessage = responseMessage || DEFAULT_REPLY;
  const signals = [textEmotion, webcamEmotion].filter(Boolean).join(" ");

  if (signals.includes("sad")) {
    sadnessStreak += 1;
  } else {
    sadnessStreak = 0;
  }

  if (sadnessStreak >= SADNESS_ALERT_THRESHOLD) {
    return `${safeMessage}\n\nI've noticed you seem down lately. Talking to someone you trust may help.`;
  }

  return safeMessage;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
