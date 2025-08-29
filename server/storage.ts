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
import { ObjectId } from "mongodb";

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
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const id = nanoid();
    
    const newUser = {
      ...insertUser,
      id,
      password: hashedPassword,
      isApproved: false,
      isAdmin: false,
    };
    
    const result = await db.insert(users).values(newUser).returning();
    return result[0];
  }

  async updateUserApproval(id: string, isApproved: boolean): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ 
        isApproved,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return result[0];
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
        .where(
          or(
            eq(messages.fromUserId, userId1),
            eq(messages.toUserId, userId1)
          )
        )
        .orderBy(messages.createdAt);
    }
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = nanoid();
    const newMessage = {
      ...message,
      id,
    };
    
    const result = await db.insert(messages).values(newMessage).returning();
    return result[0];
  }

  async getConversations(adminId: string): Promise<{user: User, lastMessage: Message | null, unreadCount: number}[]> {
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
      return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
    });
  }

  async getAccountsByUserId(userId: string): Promise<Account[]> {
    return await db.select().from(accounts).where(eq(accounts.userId, userId));
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const id = nanoid();
    const accountNumber = account.accountNumber || `SPB${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    const newAccount = {
      ...account,
      id,
      accountNumber,
      isActive: true,
    };
    
    const result = await db.insert(accounts).values(newAccount).returning();
    return result[0];
  }

  async getTransactionsByAccountId(accountId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.accountId, accountId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = nanoid();
    const newTransaction = {
      ...transaction,
      id,
      status: "completed",
    };
    
    const result = await db.insert(transactions).values(newTransaction).returning();
    return result[0];
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
        userName: users.firstName,
        userLastName: users.lastName,
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .innerJoin(users, eq(accounts.userId, users.id))
      .orderBy(desc(transactions.createdAt));
    
    return result.map(tx => ({
      ...tx,
      userName: `${tx.userName} ${tx.userLastName}`.trim(),
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
    const id = nanoid();
    const newLoan = {
      ...loan,
      id,
      status: "pending",
    };
    
    const result = await db.insert(loanApplications).values(newLoan).returning();
    return result[0];
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
        userName: users.firstName,
        userLastName: users.lastName,
      })
      .from(loanApplications)
      .innerJoin(users, eq(loanApplications.userId, users.id))
      .orderBy(desc(loanApplications.createdAt));
    
    return result.map(loan => ({
      ...loan,
      userName: `${loan.userName} ${loan.userLastName}`.trim(),
    }));
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