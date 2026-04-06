import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  test_id: { type: String, required: true }, // Links to a Test
  text: { type: String, required: true },
  image_url: { type: String },
  options: [{
    id: { type: String, required: true },
    text: { type: String, required: true }
  }],
  correct_answer: { type: String, required: true }, // ID of the correct option
  explanation: { type: String },
  marks: { type: Number, default: 1 },
  negative_marks: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Question = mongoose.model('Question', questionSchema);
export default Question;
