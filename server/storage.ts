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
  users,
  messages,
  accounts,
  transactions,
  loanApplications,
} from "@shared/schema";
import { connectDB } from "./db";
import bcrypt from "bcrypt";
import { eq, and, or, desc } from "drizzle-orm";

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
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = await connectDB();
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = await connectDB();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async updateUserApproval(id: string, isApproved: boolean): Promise<User | undefined> {
    const db = await connectDB();
    const [result] = await db
      .update(users)
      .set({ 
        isApproved, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return result || undefined;
  }

  async getPendingUsers(): Promise<User[]> {
    const db = await connectDB();
    return await db
      .select()
      .from(users)
      .where(and(eq(users.isApproved, false), eq(users.isAdmin, false)))
      .orderBy(desc(users.createdAt));
  }

  async getAllUsers(): Promise<User[]> {
    const db = await connectDB();
    return await db
      .select()
      .from(users)
      .where(eq(users.isAdmin, false))
      .orderBy(desc(users.createdAt));
  }

  async getMessages(userId1: string, userId2?: string): Promise<Message[]> {
    const db = await connectDB();
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
    const db = await connectDB();
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
    const db = await connectDB();
    return await db.select().from(accounts).where(eq(accounts.userId, userId));
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const db = await connectDB();
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
    const db = await connectDB();
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.accountId, accountId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const db = await connectDB();
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async getAllTransactions(): Promise<(Transaction & {accountNumber: string, userName: string})[]> {
    const db = await connectDB();
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
    const db = await connectDB();
    return await db
      .select()
      .from(loanApplications)
      .where(eq(loanApplications.userId, userId))
      .orderBy(desc(loanApplications.createdAt));
  }

  async createLoanApplication(loan: InsertLoanApplication): Promise<LoanApplication> {
    const db = await connectDB();
    const [newLoan] = await db.insert(loanApplications).values(loan).returning();
    return newLoan;
  }

  async getAllLoanApplications(): Promise<(LoanApplication & {userName: string})[]> {
    const db = await connectDB();
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