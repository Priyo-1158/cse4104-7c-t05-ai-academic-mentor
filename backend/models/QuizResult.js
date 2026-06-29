const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], default: [] },
  correctAnswer: { type: String },
  userAnswer: { type: String },
  explanation: { type: String },
  isCorrect: { type: Boolean },
}, { _id: false });

const quizResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  type: { type: String, enum: ['mcq', 'truefalse', 'mixed'], default: 'mcq' },
  numQuestions: { type: Number, required: true },
  correct: { type: Number, default: 0 },
  score: { type: Number, default: 0 }, // percentage 0-100
  questions: { type: [quizQuestionSchema], default: [] }, // snapshot of attempt
}, { timestamps: true });

module.exports = mongoose.model('QuizResult', quizResultSchema);
