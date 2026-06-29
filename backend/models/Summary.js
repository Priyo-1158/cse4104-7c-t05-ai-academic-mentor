const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, trim: true },
  style: { type: String, enum: ['concise', 'detailed', 'bullets', 'exam'], default: 'concise' },
  originalNotes: { type: String, required: true },
  summary: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Summary', summarySchema);
