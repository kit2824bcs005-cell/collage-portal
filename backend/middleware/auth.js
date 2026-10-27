const jwt = require('jsonwebtoken');

// Middleware to verify JWT token from Authorization header
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check if Authorization header exists and follows "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lab_secret_key');
    req.user = decoded; // Store decoded user info in request object
    next(); // Pass control to the next handler
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = verifyToken;
