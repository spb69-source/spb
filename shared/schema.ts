import { z } from "zod";

// Insert schemas
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

// Types
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  ssn: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: Date;
  isApproved: boolean;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type AdminLogin = z.infer<typeof adminLoginSchema>;

export type Message = {
  id: string;
  fromUserId: string;
  toUserId?: string;
  content: string;
  isFromAdmin: boolean;
  createdAt: Date;
};

export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Account = {
  id: string;
  userId: string;
  accountNumber: string;
  accountType: string;
  balance: string;
  isActive: boolean;
  createdAt: Date;
};

export type InsertAccount = z.infer<typeof insertAccountSchema>;

export type Transaction = {
  id: string;
  accountId: string;
  type: string;
  amount: string;
  description?: string;
  status: string;
  createdAt: Date;
};

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type LoanApplication = {
  id: string;
  userId: string;
  loanType: string;
  requestedAmount: string;
  purpose?: string;
  status: string;
  createdAt: Date;
};

export type InsertLoanApplication = z.infer<typeof insertLoanApplicationSchema>;