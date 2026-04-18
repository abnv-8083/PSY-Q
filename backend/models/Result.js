import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  guest_name: { type: String },
  is_guest: { type: Boolean, default: false },
  test_id: { type: String, required: true }, // Links to a Test
  score: { type: Number, required: true, default: 0 },
  total_marks: { type: Number, required: true, default: 0 },
  time_spent: { type: Number, default: 0 }, // in seconds
  answers: [{
    question_id: { type: String, required: true },
    selected_option: { type: String },
    is_correct: { type: Boolean, default: false }
  }],
  status: { type: String, enum: ['completed', 'in-progress'], default: 'completed' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Result = mongoose.model('Result', resultSchema);
export default Result;
