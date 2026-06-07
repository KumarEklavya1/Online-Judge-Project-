// 1. LOAD SECRETS FIRST: This must be the absolute first line of code!
// import dotenv from 'dotenv';
// dotenv.config();
import 'dotenv/config';

import express from 'express';
import cors from 'cors';

// Import your custom database connection
import connectDB from './database/db.js';

// Import your custom routes and middleware
import authRoutes from './routes/auth.js';
import verifyToken from './middleware/verifytoken.js';

const app = express();

// 2. CONNECT TO DATABASE
// Call the function from database/db.js to establish the connection
connectDB();

// 3. GLOBAL MIDDLEWARE
app.use(express.json()); // Allows the server to parse incoming JSON payloads
app.use(cors());         // Allows your React frontend to communicate with this backend

// 4. REGISTER ROUTES
// Any request starting with /api/auth gets routed to your auth.js file
app.use('/api/auth', authRoutes);

// 5. PROTECTED ROUTE (Test Endpoint)
// This route is guarded by your verifyToken bouncer.
app.get('/api/profile', verifyToken, (req, res) => {
  res.status(200).json({ 
    message: 'Welcome to the protected route! Your VIP pass worked.', 
    user: req.user // The decoded JWT payload (userId, username, email)
  });
});

// 6. START THE SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is up and running on port ${PORT}`);
});