const mongoose = require('mongoose');

const progressLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  activityType: { type: String, enum: ['quiz', 'plan', 'summary', 'chat'], required: true },
  refId: { type: mongoose.Schema.Types.ObjectId }, // points to QuizResult / StudyPlan / Summary
  subject: { type: String },
  score: { type: Number }, // applicable for quiz activities
  durationMin: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('ProgressLog', progressLogSchema);
