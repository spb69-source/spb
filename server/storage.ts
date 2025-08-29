import {
  type User,
  type InsertUser,
  type Message,
  type InsertMessage,
  type Account,
  type InsertAccount,
  type Transaction,
  type InsertTransaction,
  type LoanApplication,
  type InsertLoanApplication,
import {
  type User,
  type InsertUser,
  type Message,
  type InsertMessage,
  type Account,
  type InsertAccount,
  type Transaction,
  type InsertTransaction,
  type LoanApplication,
  type InsertLoanApplication,
} from "@shared/schema";
import { connectDB } from "./db";
import bcrypt from "bcrypt";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUserApproval(id: string, isApproved: boolean): Promise<User | undefined>;
  getPendingUsers(): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  getMessages(userId1: string, userId2?: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getConversations(adminId: string): Promise<{user: User, lastMessage: Message | null, unreadCount: number}[]>;
  getAccountsByUserId(userId: string): Promise<Account[]>;
  createAccount(account: InsertAccount): Promise<Account>;
  getTransactionsByAccountId(accountId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getAllTransactions(): Promise<(Transaction & {accountNumber: string, userName: string})[]>;
  getLoanApplicationsByUserId(userId: string): Promise<LoanApplication[]>;
  createLoanApplication(loan: InsertLoanApplication): Promise<LoanApplication>;
  getAllLoanApplications(): Promise<(LoanApplication & {userName: string})[]>;
  getAdminByCredentials(email: string, username: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const db = await connectDB();
    return await db.collection<User>("users").findOne({ id }) || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = await connectDB();
    return await db.collection<User>("users").findOne({ email }) || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = await connectDB();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      ...insertUser,
      password: hashedPassword,
      id: Math.random().toString(36).substr(2, 16),
      isApproved: false,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection<User>("users").insertOne(user);
    return user;
  }

  async updateUserApproval(id: string, isApproved: boolean): Promise<User | undefined> {
    const db = await connectDB();
    const result = await db.collection<User>("users").findOneAndUpdate(
      { id },
      { $set: { isApproved, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return result.value || undefined;
  }

  async getPendingUsers(): Promise<User[]> {
    const db = await connectDB();
    return await db.collection<User>("users").find({ isApproved: false, isAdmin: false }).sort({ createdAt: -1 }).toArray();
  }

  async getAllUsers(): Promise<User[]> {
    const db = await connectDB();
    return await db.collection<User>("users").find({ isAdmin: false }).sort({ createdAt: -1 }).toArray();
  }

  async getMessages(userId1: string, userId2?: string): Promise<Message[]> {
    const db = await connectDB();
    if (userId2) {
      return await db.collection<Message>("messages").find({
        $or: [
          { fromUserId: userId1, toUserId: userId2 },
          { fromUserId: userId2, toUserId: userId1 }
        ]
      }).sort({ createdAt: 1 }).toArray();
    } else {
      return await db.collection<Message>("messages").find({
        $or: [
          { fromUserId: userId1 },
          { toUserId: userId1 }
        ]
      }).sort({ createdAt: 1 }).toArray();
    }
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const db = await connectDB();
    const msg: Message = {
      ...message,
      id: Math.random().toString(36).substr(2, 16),
      createdAt: new Date(),
    };
    await db.collection<Message>("messages").insertOne(msg);
    return msg;
  }

  async getConversations(adminId: string): Promise<{user: User, lastMessage: Message | null, unreadCount: number}[]> {
    const db = await connectDB();
    const allUsers = await this.getAllUsers();
    const conversations: {user: User, lastMessage: Message | null, unreadCount: number}[] = [];
    for (const user of allUsers) {
      const userMessages = await this.getMessages(adminId, user.id);
      const lastMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
      const unreadCount = userMessages.filter(msg => msg.fromUserId === user.id && msg.toUserId === adminId).length;
      conversations.push({ user, lastMessage, unreadCount });
    }
    return conversations.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage!.createdAt!).getTime() - new Date(a.lastMessage!.createdAt!).getTime();
    });
  }

  async getAccountsByUserId(userId: string): Promise<Account[]> {
    const db = await connectDB();
    return await db.collection<Account>("accounts").find({ userId }).toArray();
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const db = await connectDB();
    const accountNumber = `SPB${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const acc: Account = {
      ...account,
      id: Math.random().toString(36).substr(2, 16),
      accountNumber,
      isActive: true,
      createdAt: new Date(),
    };
    await db.collection<Account>("accounts").insertOne(acc);
    return acc;
  }

  async getTransactionsByAccountId(accountId: string): Promise<Transaction[]> {
    const db = await connectDB();
    return await db.collection<Transaction>("transactions").find({ accountId }).sort({ createdAt: -1 }).toArray();
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const db = await connectDB();
    const tx: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 16),
      status: "completed",
      createdAt: new Date(),
    };
    await db.collection<Transaction>("transactions").insertOne(tx);
    return tx;
  }

  async getAllTransactions(): Promise<(Transaction & {accountNumber: string, userName: string})[]> {
    const db = await connectDB();
    const txs = await db.collection<Transaction>("transactions").find({}).sort({ createdAt: -1 }).toArray();
    const accounts = await db.collection<Account>("accounts").find({}).toArray();
    const users = await db.collection<User>("users").find({}).toArray();
    return txs.map(tx => {
      const acc = accounts.find(a => a.id === tx.accountId);
      const user = users.find(u => u.id === acc?.userId);
      return {
        ...tx,
        accountNumber: acc?.accountNumber || "",
        userName: user ? `${user.firstName} ${user.lastName}`.trim() : ""
      };
    });
  }

  async getLoanApplicationsByUserId(userId: string): Promise<LoanApplication[]> {
    const db = await connectDB();
    return await db.collection<LoanApplication>("loanApplications").find({ userId }).sort({ createdAt: -1 }).toArray();
  }

  async createLoanApplication(loan: InsertLoanApplication): Promise<LoanApplication> {
    const db = await connectDB();
    const loanApp: LoanApplication = {
      ...loan,
      id: Math.random().toString(36).substr(2, 16),
      status: "pending",
      createdAt: new Date(),
    };
    await db.collection<LoanApplication>("loanApplications").insertOne(loanApp);
    return loanApp;
  }

  async getAllLoanApplications(): Promise<(LoanApplication & {userName: string})[]> {
    const db = await connectDB();
    const loans = await db.collection<LoanApplication>("loanApplications").find({}).sort({ createdAt: -1 }).toArray();
    const users = await db.collection<User>("users").find({}).toArray();
    return loans.map(loan => {
      const user = users.find(u => u.id === loan.userId);
      return {
        ...loan,
        userName: user ? `${user.firstName} ${user.lastName}`.trim() : ""
      };
    });
  }

  async getAdminByCredentials(email: string, username: string): Promise<User | undefined> {
    // Hardcoded admin credentials as specified
    if (email === "spb@admin.io" && username === "SPB Admin") {
      return {
        id: "admin-id",
        firstName: "SPB",
        lastName: "Admin",
        email: "spb@admin.io",
        password: "",
        ssn: "",
        phone: "",
        streetAddress: "",
        city: "",
        state: "",
        zipCode: "",
        dateOfBirth: new Date(),
        isApproved: true,
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return undefined;
  }
}

export const storage = new DatabaseStorage();
    const result = await db.collection<User>("users").findOneAndUpdate(
      { id },
      { $set: { isApproved, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return result.value || undefined;
  }

  async getPendingUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(and(eq(users.isApproved, false), eq(users.isAdmin, false)))
      .orderBy(desc(users.createdAt));
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.isAdmin, false))
      .orderBy(desc(users.createdAt));
  }

  async getMessages(userId1: string, userId2?: string): Promise<Message[]> {
    if (userId2) {
      return await db
        .select()
        .from(messages)
        .where(
          or(
            and(eq(messages.fromUserId, userId1), eq(messages.toUserId, userId2)),
            and(eq(messages.fromUserId, userId2), eq(messages.toUserId, userId1))
          )
        )
        .orderBy(messages.createdAt);
    } else {
      return await db
        .select()
        .from(messages)
        .where(or(eq(messages.fromUserId, userId1), eq(messages.toUserId, userId1)))
        .orderBy(messages.createdAt);
    }
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getConversations(adminId: string): Promise<{user: User, lastMessage: Message | null, unreadCount: number}[]> {
    const allUsers = await this.getAllUsers();
    const conversations = [];

    for (const user of allUsers) {
      const userMessages = await this.getMessages(adminId, user.id);
      const lastMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
      const unreadCount = userMessages.filter(msg => msg.fromUserId === user.id && msg.toUserId === adminId).length;
      
      conversations.push({
        user,
        lastMessage,
        unreadCount
      });
    }

    return conversations.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt!).getTime() - new Date(a.lastMessage.createdAt!).getTime();
    });
  }

  async getAccountsByUserId(userId: string): Promise<Account[]> {
    return await db.select().from(accounts).where(eq(accounts.userId, userId));
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const accountNumber = `SPB${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const [newAccount] = await db
      .insert(accounts)
      .values({
        ...account,
        accountNumber,
      })
      .returning();
    return newAccount;
  }

  async getTransactionsByAccountId(accountId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.accountId, accountId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async getAllTransactions(): Promise<(Transaction & {accountNumber: string, userName: string})[]> {
    const result = await db
      .select({
        id: transactions.id,
        accountId: transactions.accountId,
        type: transactions.type,
        amount: transactions.amount,
        description: transactions.description,
        status: transactions.status,
        createdAt: transactions.createdAt,
        accountNumber: accounts.accountNumber,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(transactions)
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .leftJoin(users, eq(accounts.userId, users.id))
      .orderBy(desc(transactions.createdAt))
      .limit(100);

    return result.map(row => ({
      id: row.id,
      accountId: row.accountId,
      type: row.type,
      amount: row.amount,
      description: row.description,
      status: row.status,
      createdAt: row.createdAt,
      accountNumber: row.accountNumber || '',
      userName: `${row.firstName || ''} ${row.lastName || ''}`.trim()
    }));
  }

  async getLoanApplicationsByUserId(userId: string): Promise<LoanApplication[]> {
    return await db
      .select()
      .from(loanApplications)
      .where(eq(loanApplications.userId, userId))
      .orderBy(desc(loanApplications.createdAt));
  }

  async createLoanApplication(loan: InsertLoanApplication): Promise<LoanApplication> {
    const [newLoan] = await db.insert(loanApplications).values(loan).returning();
    return newLoan;
  }

  async getAllLoanApplications(): Promise<(LoanApplication & {userName: string})[]> {
    const result = await db
      .select({
        id: loanApplications.id,
        userId: loanApplications.userId,
        loanType: loanApplications.loanType,
        requestedAmount: loanApplications.requestedAmount,
        purpose: loanApplications.purpose,
        status: loanApplications.status,
        createdAt: loanApplications.createdAt,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(loanApplications)
      .leftJoin(users, eq(loanApplications.userId, users.id))
      .orderBy(desc(loanApplications.createdAt));

    return result.map(row => ({
      id: row.id,
      userId: row.userId,
      loanType: row.loanType,
      requestedAmount: row.requestedAmount,
      purpose: row.purpose,
      status: row.status,
      createdAt: row.createdAt,
      userName: `${row.firstName || ''} ${row.lastName || ''}`.trim()
    }));
  }

  async getAdminByCredentials(email: string, username: string): Promise<User | undefined> {
    // Hardcoded admin credentials as specified
    if (email === "spb@admin.io" && username === "SPB Admin") {
      // Return a mock admin user
      return {
        id: "admin-id",
        firstName: "SPB",
        lastName: "Admin",
        email: "spb@admin.io",
        password: "", // Not used for admin
        ssn: "",
        phone: "",
        streetAddress: "",
        city: "",
        state: "",
        zipCode: "",
        dateOfBirth: new Date(),
        isApproved: true,
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return undefined;
  }
}

export const storage = new DatabaseStorage();
