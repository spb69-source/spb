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
app.get('/api/auth/user', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    await connectDB();
    const { ObjectId } = require('mongodb');
    
    // Handle admin user specially
    if (req.session.isAdmin && req.session.userId === "admin-id") {
      const admin = await db.collection('admins').findOne({ 
        email: "spb@admin.io", 
        username: "SPB Admin" 
      });
      if (admin) {
        return res.json({
          id: admin._id.toString(),
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          isApproved: true,
          isAdmin: true
        });
      }
    }

    // Handle regular users
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(req.session.userId) 
    });
    
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: 'Session invalid' });
    }

    res.json({ 
      id: user._id.toString(), 
      email: user.email, 
      firstName: user.firstName, 
      lastName: user.lastName,
      isApproved: user.isApproved || false,
      isAdmin: user.isAdmin || false 
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    await connectDB();
    const { email, password, firstName, lastName, phone, streetAddress, city, state, zipCode, ssn } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || '',
      streetAddress: streetAddress || '',
      city: city || '',
      state: state || '',
      zipCode: zipCode || '',
      ssn: ssn || '',
      isAdmin: false,
      isApproved: false,
      createdAt: new Date()
    };

    const result = await db.collection('users').insertOne(newUser);
    
    // Create session for the new user
    req.session.userId = result.insertedId.toString();
    req.session.isAdmin = false;
    req.session.isApproved = false;

    res.json({ 
      user: { 
        id: result.insertedId.toString(), 
        email: newUser.email, 
        firstName: newUser.firstName, 
        lastName: newUser.lastName,
        isApproved: false 
      } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ message: 'Registration failed', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await db.collection('users').findOne({ email, isAdmin: { $ne: true } });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Store user in session
    req.session.userId = user._id.toString();
    req.session.isAdmin = false;
    req.session.isApproved = user.isApproved || false;

    res.json({ 
      user: { 
        id: user._id.toString(), 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName,
        isApproved: user.isApproved || false 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Admin login
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Check hardcoded admin credentials
    if (email === "spb@admin.io" && username === "SPB Admin" && password === "SpbAdminLogin@01,.") {
      await connectDB();
      let admin = await db.collection('admins').findOne({ email, username });
      
      if (!admin) {
        // Create admin if doesn't exist
        const newAdmin = {
          email: "spb@admin.io",
          username: "SPB Admin",
          firstName: "Admin",
          lastName: "User",
          isAdmin: true,
          isApproved: true,
          createdAt: new Date()
        };
        const result = await db.collection('admins').insertOne(newAdmin);
        admin = { ...newAdmin, _id: result.insertedId };
      }
      
      req.session.userId = "admin-id";
      req.session.isAdmin = true;
      req.session.isApproved = true;

      return res.json({ 
        user: { 
          id: admin._id.toString(), 
          email: admin.email, 
          firstName: admin.firstName, 
          lastName: admin.lastName,
          isAdmin: true 
        } 
      });
    }

    res.status(401).json({ message: 'Invalid admin credentials' });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Admin login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Admin routes
app.get('/api/admin/pending-users', async (req, res) => {
  try {
    if (!req.session.userId || !req.session.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    await connectDB();
    const pendingUsers = await db.collection('users').find({ 
      isApproved: false,
      isAdmin: { $ne: true }
    }).toArray();
    
    const formattedUsers = pendingUsers.map(user => ({
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      phone: user.phone,
      streetAddress: user.streetAddress,
      city: user.city,
      state: user.state,
      zipCode: user.zipCode,
      ssn: user.ssn ? `***-**-${user.ssn.slice(-4)}` : '',
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ message: 'Failed to fetch pending users' });
  }
});

app.post('/api/admin/approve-user/:id', async (req, res) => {
  try {
    if (!req.session.userId || !req.session.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    await connectDB();
    const { ObjectId } = require('mongodb');
    
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { isApproved: true } }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create default checking account for approved user
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
    if (user) {
      await db.collection('accounts').insertOne({
        userId: req.params.id,
        accountNumber: `SPB${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        accountType: 'checking',
        balance: '0.00',
        isActive: true,
        createdAt: new Date()
      });
    }
    
    res.json({ message: 'User approved successfully', user });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ message: 'Failed to approve user' });
  }
});

// Account routes
app.get('/api/accounts', async (req, res) => {
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

app.post('/api/accounts', async (req, res) => {
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
app.get('/api/messages', async (req, res) => {
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

app.post('/api/messages', async (req, res) => {
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