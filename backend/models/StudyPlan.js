const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, trim: true },
  subjects: { type: [String], required: true },
  days: { type: Number, default: 5, min: 1 },
  hoursPerDay: { type: Number, default: 3, min: 1 },
  goal: { type: String, default: 'revision' },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  extraNotes: { type: String },
  planData: { type: mongoose.Schema.Types.Mixed, required: true }, // day-by-day sessions from AI
}, { timestamps: true });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
