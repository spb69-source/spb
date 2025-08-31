const serverless = require('serverless-http');
const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const session = require('express-session');

// Create Express app
const app = express();

// MongoDB setup
const mongoUri = process.env.MONGO_URI || "mongodb+srv://securebank69_db_user:DGwUstsGEMZJPqMs@spb.qjigdqa.mongodb.net/secure-pb?retryWrites=true&w=majority&appName=SPB";
let db;
let mongoClient;

// Connect to MongoDB
async function connectDB() {
  if (!mongoClient) {
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    db = mongoClient.db('secure-pb');
    console.log('✅ Connected to MongoDB');
  }
  return db;
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (simplified for serverless)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secure-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check
app.get('/', async (req, res) => {
  try {
    await connectDB();
    res.json({ 
      status: 'OK', 
      message: 'Secure Professional Bank API is running!',
      database: db ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});

// Auth routes
app.get('/auth/user', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  res.json({ user: req.session.user });
});

app.post('/auth/register', async (req, res) => {
  try {
    await connectDB();
    const { username, email, password, firstName, lastName } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      username,
      email,
      password: hashedPassword,
      firstName: firstName || '',
      lastName: lastName || '',
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

app.post('/auth/login', async (req, res) => {
  try {
    await connectDB();
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const user = await db.collection('users').findOne({ username });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.approved) {
      return res.status(403).json({ message: 'Account pending admin approval' });
    }

    // Store user in session
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.json({ 
      message: 'Login successful',
      user: req.session.user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Admin routes
app.get('/admin/pending-users', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    await connectDB();
    const pendingUsers = await db.collection('users').find({ 
      approved: false,
      role: 'user'
    }).toArray();
    
    res.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ message: 'Failed to fetch pending users' });
  }
});

app.post('/admin/approve-user/:id', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    await connectDB();
    const { ObjectId } = require('mongodb');
    
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { approved: true } }
    );
    
    res.json({ message: 'User approved successfully' });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ message: 'Failed to approve user' });
  }
});

// Account routes
app.get('/accounts', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectDB();
    const accounts = await db.collection('accounts').find({ 
      userId: req.session.user.id 
    }).toArray();
    
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ message: 'Failed to fetch accounts' });
  }
});

app.post('/accounts', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectDB();
    const { type, name } = req.body;
    
    if (!type || !name) {
      return res.status(400).json({ message: 'Account type and name are required' });
    }
    
    const newAccount = {
      userId: req.session.user.id,
      type,
      name,
      balance: 0,
      accountNumber: 'ACC' + Date.now(),
      createdAt: new Date()
    };

    const result = await db.collection('accounts').insertOne(newAccount);
    
    res.status(201).json({ 
      message: 'Account created successfully',
      account: { ...newAccount, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ message: 'Failed to create account' });
  }
});

// Message routes
app.get('/messages', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectDB();
    const messages = await db.collection('messages').find({
      $or: [
        { userId: req.session.user.id },
        { recipientId: req.session.user.id }
      ]
    }).sort({ createdAt: -1 }).toArray();
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

app.post('/messages', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectDB();
    const { message, recipientId } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    const newMessage = {
      userId: req.session.user.id,
      senderUsername: req.session.user.username,
      recipientId: recipientId || 'admin',
      message,
      createdAt: new Date()
    };

    const result = await db.collection('messages').insertOne(newMessage);
    
    res.status(201).json({ 
      message: 'Message sent successfully',
      messageData: { ...newMessage, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Export the serverless function
module.exports.handler = serverless(app);