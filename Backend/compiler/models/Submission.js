import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    code: { type: String, required: true },
    verdict: { type: String, required: true },
    timeTaken: { type: Number }, // ms
    memoryTaken: { type: Number }, // MB
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Submission', submissionSchema);