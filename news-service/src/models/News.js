const mongoose = require("mongoose");
const { NEWS_CATEGORIES, IMPACT_LEVELS } = require("../../../common/enums");

const newsSchema = new mongoose.Schema(
  {
    newsId: {
      type: String,
      required: true,
      unique: true,
      default: () => require("uuid").v4(),
    },
    title: {
      type: String,
      required: true,
      index: true,
    },
    source: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(NEWS_CATEGORIES),
      required: true,
      index: true,
    },
    impactLevel: {
      type: String,
      enum: Object.values(IMPACT_LEVELS),
      required: true,
      index: true,
    },
    credibility: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    content: {
      type: String,
      required: true,
    },
    publishedAt: {
      type: Date,
      required: true,
      index: true,
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
    keywords: [String],
    sentiment: {
      type: String,
      enum: ["positive", "negative", "neutral"],
      default: "neutral",
    },
    sentimentConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5,
    },
    sentimentScores: {
      positive: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
    },
    isProcessed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

newsSchema.index({ publishedAt: -1 });
newsSchema.index({ category: 1, impactLevel: 1 });

module.exports = mongoose.model("News", newsSchema);
