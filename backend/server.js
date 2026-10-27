require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const verifyToken = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mwp_lab_auth';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully!'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('⚠️ Please ensure MongoDB is running locally (e.g. on port 27017) or update MONGO_URI in .env');
  });

// In-memory fallback if MongoDB service is not started on the lab computer
const inMemoryUsers = [];

// Helper functions that use Mongoose when MongoDB is connected
const findUser = async (username) => {
  if (mongoose.connection.readyState === 1) {
    return await User.findOne({ username });
  }
  return inMemoryUsers.find((u) => u.username === username);
};

const createUser = async (username, hashedPassword) => {
  if (mongoose.connection.readyState === 1) {
    const newUser = new User({ username, password: hashedPassword });
    return await newUser.save();
  }
  const newUser = { _id: 'mem_' + Date.now(), username, password: hashedPassword };
  inMemoryUsers.push(newUser);
  return newUser;
};

// ---------------------- ROUTES ----------------------

// 1. Health check route
app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'MongoDB Connected' : 'In-Memory Mode (Start MongoDB for persistence)';
  res.json({
    message: 'Experiment 8 - JWT Authentication Backend is running.',
    database: dbStatus
  });
});

// 2. User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate inputs
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    // Check if user already exists
    const existingUser = await findUser(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken. Please choose another.' });
    }

    // Hash the password using bcryptjs
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save user
    await createUser(username, hashedPassword);

    res.status(201).json({ message: 'Registration successful! You can now log in.' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// 3. User Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate inputs
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide both username and password.' });
    }

    // Find user in database
    const user = await findUser(username);
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    // Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    // Generate JWT Token
    const payload = {
      id: user._id,
      username: user.username
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'lab_secret_key', {
      expiresIn: '1h'
    });

    res.status(200).json({
      message: 'Login successful!',
      token,
      username: user.username
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// 4. Protected Dashboard Route (Requires JWT Token)
app.get('/api/dashboard', verifyToken, (req, res) => {
  // req.user is set by verifyToken middleware
  res.status(200).json({
    message: `Welcome, ${req.user.username}!`,
    user: {
      id: req.user.id,
      username: req.user.username
    },
    secretData: 'Protected resources successfully accessed using JWT authentication.',
    timestamp: new Date().toLocaleString()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});
