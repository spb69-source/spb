// Simple Express server for Glitch.com deployment
const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();

// MongoDB setup
const mongoUri = process.env.MONGO_URI || "mongodb+srv://securebank69_db_user:DGwUstsGEMZJPqMs@spb.qjigdqa.mongodb.net/secure-pb?retryWrites=true&w=majority&appName=SPB";
let db;

// Connect to MongoDB
MongoClient.connect(mongoUri, { useUnifiedTopology: true })
  .then(client => {
    console.log('✅ Connected to MongoDB');
    db = client.db('secure-pb');
  })
  .catch(error => console.error('❌ MongoDB connection error:', error));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Secure Professional Bank API is running!',
    database: db ? 'Connected' : 'Disconnected'
  });
});

// Basic auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!db) {
      return res.status(500).json({ message: 'Database not connected' });
    }

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user (in real app, hash the password!)
    const newUser = {
      username,
      email,
      password, // WARNING: In production, always hash passwords!
      role: 'user',
      approved: false,
      createdAt: new Date()
    };

    const result = await db.collection('users').insertOne(newUser);
    
    res.status(201).json({ 
      message: 'Registration successful! Awaiting admin approval.',
      userId: result.insertedId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!db) {
      return res.status(500).json({ message: 'Database not connected' });
    }

    const user = await db.collection('users').findOne({ username });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.approved) {
      return res.status(403).json({ message: 'Account pending admin approval' });
    }

    res.json({ 
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Serve static files (this will serve your built React app)
app.use(express.static('dist/public'));

// Catch-all handler for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Secure Professional Bank running on port ${port}`);
  console.log(`🌐 Database: ${db ? 'Connected' : 'Connecting...'}`);
});