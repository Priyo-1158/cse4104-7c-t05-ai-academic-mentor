const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'ai'], required: true },
  content: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

const chatSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'New Chat' },
  messages: { type: [chatMessageSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
