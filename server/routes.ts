import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertMessageSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";
import MongoStore from "connect-mongo";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration (MongoDB)
  app.use(session({
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE_URL,
      ttl: 24 * 60 * 60, // 24 hours
    }),
    secret: process.env.SESSION_SECRET || "secure-professional-bank-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.session.userId || !req.session.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // User registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(validatedData);
      
      // Create session for the new user
      req.session.userId = user.id;
      req.session.isAdmin = false;
      req.session.isApproved = user.isApproved;

      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName,
          isApproved: user.isApproved 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Registration failed", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // User login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user || user.isAdmin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.isAdmin = false;
      req.session.isApproved = user.isApproved;

      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName,
          isApproved: user.isApproved 
        } 
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin login
  app.post("/api/auth/admin-login", async (req, res) => {
    try {
      const { email, username, password } = req.body;

      // Check hardcoded admin credentials
      if (email === "spb@admin.io" && username === "SPB Admin" && password === "SpbAdminLogin@01,.") {
        const admin = await storage.getAdminByCredentials(email, username);
        if (admin) {
          req.session.userId = admin.id;
          req.session.isAdmin = true;
          req.session.isApproved = true;

          res.json({ 
            user: { 
              id: admin.id, 
              email: admin.email, 
              firstName: admin.firstName, 
              lastName: admin.lastName,
              isAdmin: true 
            } 
          });
          return;
        }
      }

      res.status(401).json({ message: "Invalid admin credentials" });
    } catch (error) {
      res.status(500).json({ message: "Admin login failed" });
    }
  });

  // Get current user
  app.get("/api/auth/user", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName,
        isApproved: user.isApproved,
        isAdmin: user.isAdmin 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get all users (admin only)
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isApproved: user.isApproved,
        createdAt: user.createdAt,
        phone: user.phone,
        streetAddress: user.streetAddress,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        ssn: `***-**-${user.ssn.slice(-4)}`, // Mask SSN
      })));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get pending users (admin only)
  app.get("/api/admin/pending-users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getPendingUsers();
      res.json(users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        phone: user.phone,
        streetAddress: user.streetAddress,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        ssn: `***-**-${user.ssn.slice(-4)}`,
      })));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending users" });
    }
  });

  // Approve user (admin only)
  app.post("/api/admin/approve-user/:id", requireAdmin, async (req, res) => {
    try {
      const user = await storage.updateUserApproval(req.params.id, true);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create default checking account for approved user
      await storage.createAccount({
        userId: user.id,
        accountType: "checking",
        balance: "0.00",
        isActive: true,
      });

      res.json({ message: "User approved successfully", user });
    } catch (error) {
      res.status(500).json({ message: "Failed to approve user" });
    }
  });

  // Reject user (admin only)
  app.post("/api/admin/reject-user/:id", requireAdmin, async (req, res) => {
    try {
      const user = await storage.updateUserApproval(req.params.id, false);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User rejected", user });
    } catch (error) {
      res.status(500).json({ message: "Failed to reject user" });
    }
  });

  // Get messages for current user
  app.get("/api/messages", requireAuth, async (req, res) => {
    try {
      const adminId = req.session.isAdmin ? req.session.userId : "admin-id";
      const userId = req.session.isAdmin ? undefined : req.session.userId;
      
      let messages;
      if (req.session.isAdmin) {
        // Admin sees all messages
        messages = await storage.getMessages(adminId);
      } else {
        // User sees messages with admin
        messages = await storage.getMessages(userId, adminId);
      }
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Get conversations (admin only)
  app.get("/api/admin/conversations", requireAdmin, async (req, res) => {
    try {
      const conversations = await storage.getConversations(req.session.userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Send message
  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const { content, toUserId } = req.body;
      
      const message = await storage.createMessage({
        fromUserId: req.session.userId,
        toUserId: toUserId || (req.session.isAdmin ? undefined : "admin-id"),
        content,
        isFromAdmin: req.session.isAdmin,
      });

      // Broadcast message via WebSocket
      if (wss) {
        const messageData = JSON.stringify({
          type: 'message',
          data: message
        });
        
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(messageData);
          }
        });
      }

      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Get user accounts
  app.get("/api/accounts", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user?.isApproved) {
        return res.status(403).json({ message: "Account not approved" });
      }

      const accounts = await storage.getAccountsByUserId(req.session.userId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  // Get user transactions
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user?.isApproved) {
        return res.status(403).json({ message: "Account not approved" });
      }

      const accounts = await storage.getAccountsByUserId(req.session.userId);
      const allTransactions = [];
      
      for (const account of accounts) {
        const transactions = await storage.getTransactionsByAccountId(account.id);
        allTransactions.push(...transactions);
      }

      res.json(allTransactions.sort((a, b) => 
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      ));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Get all transactions (admin only)
  app.get("/api/admin/transactions", requireAdmin, async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time messaging
  let wss: WebSocketServer;
  wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);
        
        // Broadcast message to all connected clients
        wss.clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message.toString());
          }
        });
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  return httpServer;
}
