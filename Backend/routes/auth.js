import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// CRITICAL: Added the .js extension to your local model import
import User from '../Models/user.js';

const router = express.Router();

// 1. We remove the fallback string. 
// If JWT_SECRET is missing from the .env file, this will be undefined.
// const JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

// 2. Production Security Check: Crash the server immediately if the secret is missing.
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in the .env file.");
  process.exit(1); 
}

// ==========================================
// 1. SIGNUP ROUTE
// ==========================================
router.post('/signup', async (req, res) => {
  try {
    // 1. Extract the data from the frontend form
    const { Username, FullName, Email, Password, DOB } = req.body;
    
    // 2. Check if a user already has this Username OR Email
    const existingUser = await User.findOne({
      $or: [ { Email: Email }, { Username: Username } ]
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User with this Email or Username already exists' });
    }

    // 3. Hash the password cryptographically
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);

    // 4. Create and save the new user to MongoDB
    const newUser = new User({ 
      Username, 
      FullName, 
      Email, 
      Password: hashedPassword, 
      DOB 
    });
    
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. LOGIN ROUTE (Codeforces Style)
// ==========================================
router.post('/login', async (req, res) => {
  try {
    // 1. We accept a generic 'identifier' (could be Username OR Email)
    const { identifier, Password } = req.body;

    // 2. Ask MongoDB to find a match for either field
    const user = await User.findOne({
      $or: [
        { Email: identifier },
        { Username: identifier }
      ]
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // 3. Verify the password against the scrambled database hash
    const validPassword = await bcrypt.compare(Password, user.Password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });

    // 4. Generate the VIP Pass (JWT) containing the user's ID, Email, and Username
    const token = jwt.sign(
      { userId: user._id, email: user.Email, username: user.Username }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, message: 'Logged in successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CRITICAL: Switched module.exports to export default
export default router;