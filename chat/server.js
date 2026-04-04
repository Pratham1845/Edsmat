require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { HfInference } = require("@huggingface/inference");

// ===== CONFIG =====
const PORT = process.env.PORT || 5502;

const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = "SamLowe/roberta-base-go_emotions";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash-lite";
const SADNESS_ALERT_THRESHOLD = 3;

const DEFAULT_REPLY = "I'm here for you. Tell me more about how you're feeling.";

// ===== INIT =====
const app = express();
const hfClient = HF_TOKEN ? new HfInference(HF_TOKEN) : null;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
console.log("GEMINI KEY:", GEMINI_API_KEY ? "Loaded" : "Missing");
console.log("HF TOKEN:", HF_TOKEN ? "Loaded" : "Missing");


let sadnessStreak = 0;

// ===== MIDDLEWARE =====
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173").split(",");
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));

// ===== SIMPLE RATE LIMIT (IN-MEMORY) =====
const requestMap = new Map();
const RATE_LIMIT = 20; // requests
const WINDOW_MS = 60 * 1000; // 1 min

function isRateLimited(ip) {
  const now = Date.now();

  if (!requestMap.has(ip)) {
    requestMap.set(ip, []);
  }

  const timestamps = requestMap.get(ip).filter(t => now - t < WINDOW_MS);
  timestamps.push(now);

  requestMap.set(ip, timestamps);

  return timestamps.length > RATE_LIMIT;
}

// ===== ROUTE =====
app.post("/chat", async (req, res) => {
  const ip = req.ip;

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Slow down." });
  }

  let { message } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required." });
  }

  // 🧹 sanitize input
  message = message.trim().slice(0, 500);
  const lowerMsg = message.toLowerCase();

  try {
    // 🟢 FAST PATH (no API calls)
    const simpleMessages = ["hi", "hello", "hey"];
    if (simpleMessages.includes(lowerMsg)) {
      return res.json({
        emotion: "neutral",
        reply: "Hey! 😊 How are you feeling today?"
      });
    }

    // 🧠 EMOTION
    const emotion = await detectEmotion(message);

    // 🤖 RESPONSE
    const reply = await getGeminiResponse(message, emotion);

    // ⚠️ SADNESS ALERT
    const finalReply = appendSadnessAlert(emotion, reply);

    return res.json({ emotion, reply: finalReply });

  } catch (error) {
    console.error("Pipeline error:", error.message);
    return res.json({
      emotion: "neutral",
      reply: DEFAULT_REPLY
    });
  }
});

// ===== EMOTION DETECTION (WITH RETRY + FALLBACK) =====
async function detectEmotion(text, attempt = 0) {
  if (!hfClient) return "neutral";

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
    const topEmotions = sorted.slice(0, 2).map(e => e.label);

    return topEmotions.join(" & ");

  } catch (error) {
    console.error(`HF error (attempt ${attempt + 1}):`, error.message);

    if (attempt < 1) {
      await wait(800);
      return detectEmotion(text, attempt + 1);
    }

    return "neutral"; // 🛟 fallback
  }
}

// ===== GEMINI RESPONSE (TIMEOUT + FALLBACK) =====
async function getGeminiResponse(message, emotion) {
  if (!genAI) {
    return generateLocalReply(message, emotion);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL
    });

    const prompt = buildPrompt(message, emotion);

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const text = response.text();

    if (!text) throw new Error("Empty response");

    return text.trim();

  } catch (error) {
    console.error("Gemini error:", error.message);

    return generateLocalReply(message, emotion);
  }
}

// ===== LOCAL FALLBACK AI =====
function generateLocalReply(message, emotion) {
  const msg = message.toLowerCase();

  if (msg.includes("hi") || msg.includes("hello")) {
    return "Hey! 😊 How are you feeling today?";
  }

  if (emotion.includes("sad")) {
    return "I'm sorry you're feeling this way. Want to talk about it?";
  }

  if (emotion.includes("angry")) {
    return "That sounds frustrating. Maybe take a short break?";
  }

  if (emotion.includes("joy")) {
    return "That's great to hear! 😊 What made your day better?";
  }

  return DEFAULT_REPLY;
}

// ===== PROMPT =====
function buildPrompt(message, emotion) {
  return `
You are an AI student support assistant.

You are given:
1. Student message
2. Emotion detected by an external AI model

Your task is to:
- Analyze student intent
- Use the provided emotion as the primary emotional signal
- Predict dropout risk
- Generate a helpful response

---

INPUTS:

Detected Emotion (from external model):
${emotion}

Student Message:
"""
${message}
"""

---

CLASSIFY INTO:

INTENT TYPES:
- RISK_DROPOUT → stress, burnout, disengagement
- PASSION_SHIFT → career change / interest
- STUDY_DOUBT → academic question
- NORMAL → general

---

RISK LEVEL:
LOW, MEDIUM, HIGH

---

IMPORTANT RULES:

- Trust the provided emotion more than text guessing
- If emotion = sad / stressed / anxious → higher risk probability
- If emotion = motivated / happy → low risk
- If STUDY_DOUBT → always LOW risk
- Do NOT contradict the given emotion

---

GENERATE:

- intent
- emotion (use given one)
- risk_level
- confidence (0–100)
- reason
- recommended_action
- response_message

---

RESPONSE MESSAGE RULES:

- STUDY_DOUBT → explain concept simply
- RISK_DROPOUT → calm, supportive tone
- PASSION_SHIFT → encouraging + guidance
- Keep it short and human-like

---

OUTPUT STRICTLY IN JSON:

{
  "intent": "",
  "emotion": "${emotion}",
  "risk_level": "",
  "confidence": "",
  "reason": "",
  "recommended_action": "",
  "response_message": ""
}
`;
}



// ===== SADNESS ALERT =====
function appendSadnessAlert(emotion, reply) {
  if (emotion.includes("sadness")) {
    sadnessStreak++;
  } else {
    sadnessStreak = 0;
  }

  if (emotion.includes("sadness") && sadnessStreak >= SADNESS_ALERT_THRESHOLD) {
    return `${reply}\n\nI've noticed you seem a bit down lately. Talking to someone you trust might really help 💙`;
  }

  return reply;
}

// ===== UTILS =====
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== START =====
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});