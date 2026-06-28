// 1. LOAD SECRETS FIRST
import 'dotenv/config';

// 2. THIRD-PARTY IMPORTS
import express from 'express';
import cors from 'cors';

// 3. CUSTOM IMPORTS
import connectDB from './database/db.js';
import authRoutes from './routes/auth.js';
import verifyToken from './middleware/verifytoken.js';
import problemRoutes from './routes/problems.js';
import submissionRoutes from './routes/submissions.js';
import { connectProducer } from './config/kafka.js';

const app = express();

// 4. GLOBAL MIDDLEWARE
app.use(express.json());
app.use(cors());

// 5. REGISTER ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/problems', problemRoutes);

// 6. PROTECTED ROUTE (Test Endpoint)
app.get('/api/profile', verifyToken, (req, res) => {
  res.status(200).json({ 
    message: 'Welcome to the protected route! Your VIP pass worked.', 
    user: req.user 
  });
});

// 7. MAIN STARTUP FUNCTION
const startServer = async () => {
    try {
        // Connect Database
        await connectDB();
        
        // Connect Kafka Producer
        // await connectProducer();

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server is up and running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1); // Exit if we cannot connect to critical services
    }
};

startServer();