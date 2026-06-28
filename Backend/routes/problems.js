import express from 'express';
import Problem from '../models/Problem.js';
import verifyToken from '../middleware/verifytoken.js';

const router = express.Router();

// ==========================================
// 1. GET ALL PROBLEMS (For the Problemset Page)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find().select('title difficulty');
    res.status(200).json(problems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. GET SPECIFIC PROBLEM (For the Coding Page)
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    
    res.status(200).json(problem);
  } catch (err) {
    res.status(500).json({ error: 'Invalid Problem ID' });
  }
});

// ==========================================
// 3. CREATE A PROBLEM (For the Admin/Problem Setter Flow)
// ==========================================
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, difficulty, timeLimit, memoryLimit, testCases } = req.body;
    
    const newProblem = new Problem({
      title, description, difficulty, timeLimit, memoryLimit, testCases
    });

    await newProblem.save();
    res.status(201).json({ message: 'Problem created successfully!', problem: newProblem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;