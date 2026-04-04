const FALLBACK_RESPONSE = {
  intent: "NORMAL",
  emotion: "neutral",
  risk_level: "LOW",
  risk_percentage: 20,
  confidence: 50,
  reason: "Unable to parse model response reliably.",
  recommended_action: "Share a bit more detail so I can support you better.",
  response_message: "I'm here to help. Can you tell me more?"
};

function cleanAndParseJSON(text) {
  if (!text || typeof text !== "string") {
    return { ...FALLBACK_RESPONSE };
  }

  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  try {
    return { ...FALLBACK_RESPONSE, ...JSON.parse(cleaned) };
  } catch (_error) {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start !== -1 && end !== -1 && end > start) {
      try {
        const jsonSlice = cleaned.slice(start, end + 1);
        return { ...FALLBACK_RESPONSE, ...JSON.parse(jsonSlice) };
      } catch (_sliceError) {
        return { ...FALLBACK_RESPONSE };
      }
    }

    return { ...FALLBACK_RESPONSE };
  }
}

module.exports = {
  cleanAndParseJSON,
  FALLBACK_RESPONSE
};
