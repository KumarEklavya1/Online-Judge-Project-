import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  isHidden: { type: Boolean, default: false }
});

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  
  // Constraints
  timeLimit: { type: Number, default: 1000 }, // milliseconds
  memoryLimit: { type: Number, default: 256 }, // megabytes
  
  // Array of test cases containing both samples and hidden ones
  testCases: [testCaseSchema] 
  
}, { timestamps: true });

export default mongoose.model('Problem', problemSchema);