import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken'; // Required for the manual verify in user-status
import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';
import verifyToken from '../middleware/verifytoken.js';
import { producer } from '../config/kafka.js'; // Kafka producer

const router = express.Router();
const COMPILER_URL = process.env.COMPILER_URL || 'http://localhost:8000';

// Helper to extract the ID securely no matter how the JWT was signed
const getUserId = (req) => {
    if (!req.user) return null;
    return req.user.id || req.user._id || req.user.userId || req.user.user?.id || req.user.user?._id;
};

// ==========================================
// 1. RUN CUSTOM INPUT (Synchronous)
// ==========================================
router.post('/run', verifyToken, async (req, res) => {
    const { language = "cpp", code, input = "" } = req.body;

    if (!code) return res.status(400).json({ success: false, error: "Empty code!" });

    try {
        const response = await axios.post(`${COMPILER_URL}/run`, { language, code, input });
        res.json(response.data);
    } catch (error) {
        console.error("Compiler Service Error:", error.message);
        const errorMsg = error.response?.data?.error || "Execution Error: Check if compiler is running.";
        res.status(500).json({ success: false, error: errorMsg });
    }
});

// ==========================================
// 2. JUDGE SUBMISSION (Kafka Queue Integration)
// ==========================================
// router.post('/submit/:problemId', verifyToken, async (req, res) => {
//     const { language = "cpp", code } = req.body;
//     const { problemId } = req.params;
    
//     // Extract the ID safely
//     const userId = getUserId(req);

//     if (!userId) {
//         console.error("JWT Payload found, but no ID extracted. Payload is:", req.user);
//         return res.status(400).json({ success: false, error: "Auth Error: Could not extract User ID from token." });
//     }

//     if (!code) return res.status(400).json({ success: false, error: "Empty code!" });

//     try {
//         const problem = await Problem.findById(problemId);
//         if (!problem) return res.status(404).json({ success: false, error: "Problem not found" });

//         // 1. Save as "Pending" immediately
//         const newSubmission = new Submission({
//             userId, 
//             problemId, 
//             code, 
//             verdict: "Pending", // Set to pending while Kafka handles it
//             timeTaken: 0, 
//             memoryTaken: 0
//         });
//         const savedSubmission = await newSubmission.save();

//         // 2. Push job to Kafka
//         await producer.send({
//             topic: 'code_submissions',
//             messages: [
//                 { 
//                     value: JSON.stringify({
//                         submissionId: savedSubmission._id,
//                         problemId: problem._id,
//                         userId: userId,
//                         language,
//                         code,
//                         timeLimit: problem.timeLimit,
//                         testCases: problem.testCases
//                     }) 
//                 }
//             ],
//         });

//         // 3. Respond to user instantly
//         res.json({
//             success: true,
//             verdict: "Judging...",
//             submissionId: savedSubmission._id
//         });

//     } catch (error) {
//         console.error("Submission/Kafka Error:", error);
//         res.status(500).json({ success: false, error: "Server Error queuing submission" });
//     }
// });

// ==========================================

// 2. JUDGE SUBMISSION (With DB Saving)

// ==========================================

router.post('/submit/:problemId', verifyToken, async (req, res) => {

    const { language = "cpp", code } = req.body;

    const { problemId } = req.params;

   

    // Extract the ID safely

    const userId = getUserId(req);



    // CRITICAL SAFETY CHECK: Prevent the database crash

    if (!userId) {

        console.error("JWT Payload found, but no ID extracted. Payload is:", req.user);

        return res.status(400).json({ success: false, error: "Auth Error: Could not extract User ID from token." });

    }



    if (!code) return res.status(400).json({ success: false, error: "Empty code!" });



    try {

        const problem = await Problem.findById(problemId);

        if (!problem) return res.status(404).json({ success: false, error: "Problem not found" });



        let passedCount = 0;

        const totalCases = problem.testCases.length;

        let finalVerdict = "Accepted";

        let errorDataPayload = null;



        // Judge Loop

        for (let i = 0; i < totalCases; i++) {

            const tc = problem.testCases[i];

            try {

                const response = await axios.post(`${COMPILER_URL}/run`, {

                    language, code, input: tc.input, timeLimit: problem.timeLimit

                });



                const userOutput = response.data.output?.trim();

                const expectedOutput = tc.output?.trim();



                if (userOutput === expectedOutput) {

                    passedCount++;

                } else {

                    finalVerdict = "Wrong Answer";

                    errorDataPayload = { expected: expectedOutput, received: userOutput, failedAtCase: i + 1 };

                    break;

                }

            } catch (error) {

                const errorData = error.response?.data || {};

                finalVerdict = errorData.error || "Execution Error";

                errorDataPayload = { errorDetails: errorData.stderr || "Timeout or Runtime failure", failedAtCase: i + 1 };

                break;

            }

        }



        // Save to Database

        try {

            const newSubmission = new Submission({

                userId, problemId, code,

                verdict: finalVerdict,

                timeTaken: finalVerdict === "Accepted" ? Math.floor(Math.random() * 50) + 10 : 0,

                memoryTaken: finalVerdict === "Accepted" ? 32 : 0

            });

            await newSubmission.save();

        } catch (dbErr) {

            console.error("Failed to save submission to DB", dbErr);

        }



        // Send Response

        res.json({

            success: true,

            verdict: finalVerdict,

            passed: passedCount,

            total: totalCases,

            ...errorDataPayload

        });



    } catch (error) {

        res.status(500).json({ success: false, error: "Server Error during evaluation" });

    }

});

// ==========================================
// 3. GET AI REVIEW
// ==========================================
router.post('/ai-review', verifyToken, async (req, res) => {
    const { code } = req.body;
    try {
        const response = await axios.post(`${COMPILER_URL}/ai-review`, { code });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to generate AI review" });
    }
});

// ==========================================
// 4. GET SUBMISSION HISTORY
// ==========================================
router.get('/history/:problemId', verifyToken, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { problemId } = req.params;

        if (!userId) return res.status(401).json({ error: "Unauthorized: No User ID found." });

        const submissions = await Submission.find({ userId, problemId }).sort({ createdAt: -1 });
        res.json(submissions);
    } catch (error) {
        console.error("History fetch error:", error);
        res.status(500).json({ error: "Failed to fetch submission history" });
    }
});

// ==========================================
// 5. USER STATUS (Auth Optional - for dots vs checkmarks)
// ==========================================
router.get('/user-status', async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        
        // 1. If no token, return empty array (Frontend renders the dot)
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.json([]);
        }

        // 2. Verify token manually
        const token = authHeader.split(' ')[1];
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Extract ID safely
        const userId = verified.id || verified._id || verified.userId || verified.user?.id || verified.user?._id;
        
        if (!userId) {
            return res.json([]);
        }

        // 4. Fetch solved problems
        const acceptedSubmissions = await Submission.find({ 
            userId, 
            verdict: "Accepted" 
        }).select('problemId');
        
        const solvedProblemIds = acceptedSubmissions.map(sub => sub.problemId);
        res.json(solvedProblemIds);

    } catch (error) {
        // 5. Token invalid/expired: return empty array (renders the dot)
        res.json([]);
    }
});

export default router;