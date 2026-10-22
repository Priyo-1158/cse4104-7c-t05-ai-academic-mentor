/**
 * Note / Summary Model
 * CSE4104-7C-T05 | AI Academic Mentor
 */

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // FIX (Week 07 audit): /api/notes and /api/summary both read/wrote this
  // collection with zero discriminator, so a note created via one endpoint
  // silently appeared in the other endpoint's list. `kind` separates them
  // at the schema level. Existing documents without this field are treated
  // as 'note' by the routes below for backward compatibility.
  kind: {
    type: String,
    enum: ['note', 'summary', 'chat'],
    default: 'note',
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  originalText: {
    type: String,
    required: [true, 'Original text is required']
  },
  summary: {
    type: String,
    default: null
  },
  subject: {
    type: String,
    trim: true,
    default: null
  },
  style: {
    type: String,
    enum: ['concise', 'detailed', 'bullets', 'exam'],
    default: 'concise'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);
