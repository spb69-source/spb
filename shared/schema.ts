import { z } from "zod";
import { pgTable, varchar, text, boolean, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";

// Database Tables
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  ssn: varchar("ssn", { length: 11 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  streetAddress: varchar("street_address", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  zipCode: varchar("zip_code", { length: 10 }).notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  accountNumber: varchar("account_number", { length: 50 }).unique().notNull(),
  accountType: varchar("account_type", { length: 50 }).default("checking").notNull(),
  balance: varchar("balance", { length: 20 }).default("0.00").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey(),
  accountId: varchar("account_id").references(() => accounts.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  amount: varchar("amount", { length: 20 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("completed").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey(),
  fromUserId: varchar("from_user_id").references(() => users.id).notNull(),
  toUserId: varchar("to_user_id").references(() => users.id),
  content: text("content").notNull(),
  isFromAdmin: boolean("is_from_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const loanApplications = pgTable("loan_applications", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  loanType: varchar("loan_type", { length: 100 }).notNull(),
  requestedAmount: varchar("requested_amount", { length: 20 }).notNull(),
  purpose: text("purpose"),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas (using createInsertSchema with Drizzle tables)
export const insertUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  ssn: z.string().min(1, "SSN is required"),
  phone: z.string().min(1, "Phone number is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  dateOfBirth: z.date(),
});

export const insertMessageSchema = z.object({
  fromUserId: z.string(),
  toUserId: z.string().optional(),
  content: z.string().min(1, "Message content is required"),
  isFromAdmin: z.boolean().default(false),
});

export const insertAccountSchema = z.object({
  userId: z.string(),
  accountNumber: z.string(),
  accountType: z.string().default("checking"),
  balance: z.string().default("0.00"),
  isActive: z.boolean().default(true),
});

export const insertTransactionSchema = z.object({
  accountId: z.string(),
  type: z.string(), // 'credit', 'debit', 'transfer'
  amount: z.string(),
  description: z.string().optional(),
  status: z.string().default("completed"), // 'pending', 'completed', 'failed'
});

export const insertLoanApplicationSchema = z.object({
  userId: z.string(),
  loanType: z.string(),
  requestedAmount: z.string(),
  purpose: z.string().optional(),
  status: z.string().default("pending"), // 'pending', 'approved', 'rejected'
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Types (using Drizzle infer)
export type User = typeof users.$inferSelect;
export type InsertUser = Omit<typeof users.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = Omit<typeof messages.$inferInsert, 'id' | 'createdAt'>;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = Omit<typeof accounts.$inferInsert, 'id' | 'createdAt'>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = Omit<typeof transactions.$inferInsert, 'id' | 'createdAt'>;
export type LoanApplication = typeof loanApplications.$inferSelect;
export type InsertLoanApplication = Omit<typeof loanApplications.$inferInsert, 'id' | 'createdAt'>;

export type LoginUser = z.infer<typeof loginSchema>;
export type AdminLogin = z.infer<typeof adminLoginSchema>;