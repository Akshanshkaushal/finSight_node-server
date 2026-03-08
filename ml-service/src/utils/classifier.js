const { NEWS_CATEGORIES, IMPACT_LEVELS } = require("../../common/enums");
const axios = require("axios");

const modelUrl = process.env.ML_MODEL_URL; // optional external classifier endpoint
const modelApiKey = process.env.ML_MODEL_API_KEY; // optional
const llmUrl = process.env.ML_LLM_URL; // optional LLM endpoint for impact
const llmApiKey = process.env.ML_LLM_API_KEY; // optional

// FinBERT service configuration
const finbertUrl = process.env.FINBERT_URL || "http://localhost:5000";
const useFinbert = process.env.USE_FINBERT === "true" || true; // Enable by default

const keywordMap = {
  [NEWS_CATEGORIES.RBI_POLICY]: [
    "rbi",
    "repo rate",
    "monetary policy",
    "crr",
    "slr",
    "policy",
  ],
  [NEWS_CATEGORIES.INFLATION]: [
    "inflation",
    "cpi",
    "wpi",
    "price rise",
    "cost of living",
  ],
  [NEWS_CATEGORIES.INTEREST_RATE]: [
    "interest rate",
    "lending rate",
    "borrowing rate",
    "fd rate",
    "loan rate",
  ],
  [NEWS_CATEGORIES.CURRENCY]: [
    "rupee",
    "dollar",
    "exchange rate",
    "forex",
    "currency",
  ],
  [NEWS_CATEGORIES.MARKET_EVENT]: [
    "stock market",
    "sensex",
    "nifty",
    "market crash",
    "rally",
    "bull",
    "bear",
  ],
};

function classify(text) {
  const lc = text.toLowerCase();
  for (const [category, kws] of Object.entries(keywordMap)) {
    if (kws.some((k) => lc.includes(k))) return category;
  }
  return NEWS_CATEGORIES.OTHER;
}

function impact(category, credibility = 80, keywords = []) {
  let score = 0;
  if (category === NEWS_CATEGORIES.RBI_POLICY) score += 40;
  else if (category === NEWS_CATEGORIES.INTEREST_RATE) score += 35;
  else if (category === NEWS_CATEGORIES.INFLATION) score += 30;
  else score += 20;

  score += (credibility / 100) * 20;
  score += Math.min(keywords.length * 5, 20);

  if (score >= 60) return IMPACT_LEVELS.HIGH;
  if (score >= 30) return IMPACT_LEVELS.MEDIUM;
  return IMPACT_LEVELS.LOW;
}

function extractKeywords(text, category) {
  const lc = text.toLowerCase();
  const kws = keywordMap[category] || [];
  return kws.filter((k) => lc.includes(k));
}

async function classifyWithModel(text, credibility = 80) {
  if (!modelUrl) return null;
  try {
    const resp = await axios.post(
      modelUrl,
      { text, credibility },
      {
        timeout: 5000,
        headers: modelApiKey ? { Authorization: `Bearer ${modelApiKey}` } : {},
      },
    );
    return resp.data?.data || resp.data || null;
  } catch (err) {
    console.error("External model classification failed:", err.message);
    return null;
  }
}

async function classifyWithFinBERT({
  title = "",
  content = "",
  credibility = 80,
}) {
  if (!useFinbert) return null;

  try {
    const resp = await axios.post(
      `${finbertUrl}/classify`,
      { title, content, credibility },
      {
        timeout: 10000, // FinBERT may take longer for inference
        headers: { "Content-Type": "application/json" },
      },
    );

    if (resp.data?.success && resp.data?.data) {
      const result = resp.data.data;
      return {
        category: result.category,
        impactLevel: result.impactLevel,
        keywords: result.keywords || [],
        sentiment: result.sentiment,
        confidence: result.confidence,
        sentimentScores: result.sentimentScores,
      };
    }
    return null;
  } catch (err) {
    console.error("FinBERT classification failed:", err.message);
    // If FinBERT service is unavailable, return null to use fallback
    return null;
  }
}

async function classifyAdvanced({
  title = "",
  content = "",
  credibility = 80,
}) {
  // Try FinBERT first (AI-powered classification)
  const finbertResult = await classifyWithFinBERT({
    title,
    content,
    credibility,
  });
  if (finbertResult?.category && finbertResult?.impactLevel) {
    return {
      category: finbertResult.category,
      impactLevel: finbertResult.impactLevel,
      keywords: finbertResult.keywords || [],
      sentiment: finbertResult.sentiment,
      confidence: finbertResult.confidence,
      sentimentScores: finbertResult.sentimentScores,
    };
  }

  // Try external model URL (if configured)
  const text = `${title} ${content}`.trim();
  const modelResult = await classifyWithModel(text, credibility);
  if (modelResult?.category && modelResult?.impactLevel) {
    return {
      category: modelResult.category,
      impactLevel: modelResult.impactLevel,
      keywords: modelResult.keywords || [],
    };
  }

  // Fallback to keyword-based heuristic classification
  const category = classify(text);
  const keywords = extractKeywords(text, category);
  let impactLevel = impact(category, credibility, keywords);

  // Try LLM for impact scoring (if configured)
  const llmImpact = await impactWithLLM(text, category, credibility);
  if (llmImpact && Object.values(IMPACT_LEVELS).includes(llmImpact)) {
    impactLevel = llmImpact;
  }

  return {
    category,
    impactLevel,
    keywords,
    sentiment: "neutral", // Default for fallback
    confidence: 0.5,
  };
}

async function impactWithLLM(text, category, credibility = 80) {
  if (!llmUrl) return null;
  try {
    const prompt = `You are a financial risk assistant. Given news text and a category, return only a JSON with "impactLevel" one of ["LOW","MEDIUM","HIGH"] based on seriousness and credibility (${credibility}/100):\nText: ${text}\nCategory: ${category}\nResponse JSON:`;
    const resp = await axios.post(
      llmUrl,
      { prompt },
      {
        timeout: 6000,
        headers: llmApiKey ? { Authorization: `Bearer ${llmApiKey}` } : {},
      },
    );
    const raw = resp.data?.data || resp.data || {};
    const impactLevel =
      raw.impactLevel || raw.impact || raw.result?.impactLevel;
    if (impactLevel && Object.values(IMPACT_LEVELS).includes(impactLevel)) {
      return impactLevel;
    }
    return null;
  } catch (err) {
    console.error("LLM impact scoring failed:", err.message);
    return null;
  }
}

module.exports = {
  classify,
  impact,
  extractKeywords,
  classifyAdvanced,
  classifyWithFinBERT,
};
