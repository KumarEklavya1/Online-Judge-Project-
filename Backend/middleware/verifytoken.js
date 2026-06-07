import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  // 1. Extract the Authorization header from the incoming request
  const authHeader = req.header('Authorization');

  // 2. Production Security Check: Ensure header exists AND follows standard "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      message: 'Access Denied: No Token Provided or Invalid Format' 
    });
  }

  try {
    // 3. Isolate the actual token string (splitting at the space)
    const token = authHeader.split(' ')[1];

    // 4. Cryptographically verify the token's signature using your .env secret
    const JWT_SECRET = process.env.JWT_SECRET;
    const verified = jwt.verify(token,JWT_SECRET);

    // 5. Attach the decoded payload (userId, email, username) to the request object
    req.user = verified;

    // 6. Open the gate to allow the request to proceed to the actual route
    next();
    
  } catch (err) {
    // 7. Catch errors (e.g., token is expired, tampered with, or completely fake)
    return res.status(403).json({ 
      message: 'Access Denied: Invalid or Expired Token' 
    });
  }
};

// ES Module export
export default verifyToken;