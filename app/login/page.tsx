"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Smartphone, LogIn, ArrowRight } from "lucide-react";
import Header from "../components/Header";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const validatePhone = (phoneNumber: string): boolean => {
    return /^09\d{9}$/.test(phoneNumber);
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!phone.trim()) {
      setError("لطفاً شماره موبایل را وارد کنید");
      return;
    }

    if (!validatePhone(phone)) {
      setError("شماره موبایل معتبر نیست. فرمت صحیح: 09123456789");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, step: "request" }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("کد تایید ارسال شد. هر کد 6 رقمی را وارد کنید");
        setStep("otp");
      } else {
        setError(data.message || "خطا در ارسال کد تایید");
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!otp.trim()) {
      setError("لطفاً کد تایید را وارد کنید");
      return;
    }

    if (otp.length !== 6) {
      setError("کد تایید باید 6 رقم باشد");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, step: "verify" }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        login(data.token);
        router.push("/");
      } else {
        setError(data.message || "کد تایید اشتباه است");
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20 md:pb-0">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">ورود به حساب کاربری</h1>
            <p className="text-sm text-slate-600">با شماره موبایل خود وارد شوید</p>
          </div>

          {step === "phone" ? (
            /* Phone Input Step */
            <form onSubmit={handleRequestOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2" dir="rtl">
                  شماره موبایل
                </label>
                <div className="relative">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Smartphone className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09123456789"
                    maxLength={11}
                    className={`w-full pr-12 pl-4 py-3 rounded-lg border ${
                      error ? "border-red-500" : "border-slate-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                    dir="ltr"
                  />
                </div>
                {error && <p className="mt-1 text-xs text-red-500" dir="rtl">{error}</p>}
                {message && <p className="mt-1 text-xs text-green-600" dir="rtl">{message}</p>}
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse"
                dir="rtl"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>در حال ارسال...</span>
                  </>
                ) : (
                  <>
                    <span>ارسال کد تایید</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          ) : (
            /* OTP Verification Step */
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2" dir="rtl">
                  کد تایید ارسال شده به {phone}
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className={`w-full text-center py-3 rounded-lg border ${
                    error ? "border-red-500" : "border-slate-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl font-bold tracking-widest`}
                  dir="ltr"
                  autoFocus
                />
                {error && <p className="mt-1 text-xs text-red-500 text-center" dir="rtl">{error}</p>}
                {message && <p className="mt-1 text-xs text-green-600 text-center" dir="rtl">{message}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setOtp("");
                    setError("");
                    setMessage("");
                  }}
                  className="flex-1 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                >
                  تغییر شماره
                </button>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse"
                  dir="rtl"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>در حال ورود...</span>
                    </>
                  ) : (
                    <>
                      <span>تایید و ورود</span>
                      <LogIn className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          )}

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600" dir="rtl">
              حساب کاربری ندارید؟{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                ثبت‌نام کنید
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
