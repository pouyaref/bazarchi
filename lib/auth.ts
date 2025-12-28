import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Use /tmp in Vercel (serverless) or data folder in local development
const getUsersFilePath = () => {
  if (process.env.VERCEL) {
    return path.join("/tmp", "users.json");
  }
  return path.join(process.cwd(), "data", "users.json");
};

const USERS_FILE = getUsersFilePath();

export interface User {
  id: string;
  phone: string;
  name?: string;
  password: string;
  createdAt: string;
}

// Initialize users file if it doesn't exist
function ensureUsersFile() {
  const filePath = getUsersFilePath();
  const dataDir = path.dirname(filePath);
  
  // In Vercel /tmp, directory always exists, but check anyway
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (error) {
      // Directory might already exist or be /tmp which always exists
      console.log("Directory creation skipped:", error);
    }
  }
  
  if (!fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    } catch (error) {
      console.error("Error creating users file:", error);
    }
  }
}

// Read users from file
function getUsers(): User[] {
  ensureUsersFile();
  try {
    const filePath = getUsersFilePath();
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
}

// Write users to file
function saveUsers(users: User[]) {
  ensureUsersFile();
  try {
    const filePath = getUsersFilePath();
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error saving users file:", error);
    throw error;
  }
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

