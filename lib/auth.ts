import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const USERS_FILE = path.join(process.cwd(), "data", "users.json");

export interface User {
  id: string;
  phone: string;
  name?: string;
  password: string;
  createdAt: string;
}

// Initialize users file if it doesn't exist
function ensureUsersFile() {
  const dataDir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
}

// Read users from file
function getUsers(): User[] {
  ensureUsersFile();
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write users to file
function saveUsers(users: User[]) {
  ensureUsersFile();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Generate OTP (for testing, returns fixed code. In production, send SMS)
export function generateOTP(phone: string): string {
  // For development: return fixed OTP
  // In production, generate random 6-digit code and send via SMS service
  return "123456";
}

// Verify phone number format
export function isValidPhone(phone: string): boolean {
  return /^09\d{9}$/.test(phone);
}

// Register new user
export async function registerUser(phone: string, name?: string, password?: string): Promise<{ success: boolean; message: string; otp?: string }> {
  if (!isValidPhone(phone)) {
    return { success: false, message: "شماره موبایل معتبر نیست. فرمت صحیح: 09123456789" };
  }

  const users = getUsers();
  
  // Check if user already exists
  if (users.find(u => u.phone === phone)) {
    return { success: false, message: "این شماره موبایل قبلاً ثبت شده است" };
  }

  // Generate OTP
  const otp = generateOTP(phone);
  
  // In production, send OTP via SMS here
  // await sendSMS(phone, `کد تایید شما: ${otp}`);
  
  return { success: true, message: "کد تایید ارسال شد", otp };
}

// Verify OTP and create user
export async function verifyOTPAndRegister(phone: string, otp: string, name?: string): Promise<{ success: boolean; message: string; token?: string }> {
  if (!isValidPhone(phone)) {
    return { success: false, message: "شماره موبایل معتبر نیست" };
  }

  // Accept any 6-digit code
  if (!/^\d{6}$/.test(otp)) {
    return { success: false, message: "کد تایید باید 6 رقم باشد" };
  }

  const users = getUsers();
  
  // Check if user already exists
  if (users.find(u => u.phone === phone)) {
    return { success: false, message: "این شماره موبایل قبلاً ثبت شده است" };
  }

  // Create new user
  const newUser: User = {
    id: Date.now().toString(),
    phone,
    name: name || "",
    password: "", // No password needed for phone auth
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Generate JWT token
  const token = jwt.sign({ userId: newUser.id, phone: newUser.phone }, JWT_SECRET, {
    expiresIn: "30d",
  });

  return { success: true, message: "ثبت‌نام با موفقیت انجام شد", token };
}

// Login with phone and OTP
export async function loginWithOTP(phone: string, otp: string): Promise<{ success: boolean; message: string; token?: string }> {
  if (!isValidPhone(phone)) {
    return { success: false, message: "شماره موبایل معتبر نیست" };
  }

  const users = getUsers();
  const user = users.find(u => u.phone === phone);

  if (!user) {
    return { success: false, message: "کاربری با این شماره موبایل یافت نشد" };
  }

  // Accept any 6-digit code
  if (!/^\d{6}$/.test(otp)) {
    return { success: false, message: "کد تایید باید 6 رقم باشد" };
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, {
    expiresIn: "30d",
  });

  return { success: true, message: "ورود موفق", token };
}

// Request OTP for login
export async function requestLoginOTP(phone: string): Promise<{ success: boolean; message: string; otp?: string }> {
  if (!isValidPhone(phone)) {
    return { success: false, message: "شماره موبایل معتبر نیست" };
  }

  const users = getUsers();
  const user = users.find(u => u.phone === phone);

  if (!user) {
    return { success: false, message: "کاربری با این شماره موبایل یافت نشد" };
  }

  // Generate OTP
  const otp = generateOTP(phone);
  
  // In production, send OTP via SMS here
  // await sendSMS(phone, `کد تایید شما: ${otp}`);
  
  return { success: true, message: "کد تایید ارسال شد", otp };
}

// Verify JWT token
export function verifyToken(token: string): { userId?: string; phone?: string; error?: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; phone: string };
    return { userId: decoded.userId, phone: decoded.phone };
  } catch (error) {
    return { error: "Token invalid or expired" };
  }
}

// Get user by ID
export function getUserById(userId: string): User | null {
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
}

// Get user by phone
export function getUserByPhone(phone: string): User | null {
  const users = getUsers();
  return users.find(u => u.phone === phone) || null;
}

