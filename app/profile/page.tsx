"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { useAuth } from "@/lib/auth-context";
import { User, Phone, Calendar, Edit, LogOut, Package, MessageCircle, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex items-center space-x-4 space-x-reverse mb-6" dir="rtl">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-900 mb-1" dir="rtl">
                  {user.name || "کاربر بازار چی"}
                </h1>
                <p className="text-slate-600 text-sm" dir="rtl">
                  {user.phone}
                </p>
              </div>
              <button
                onClick={() => router.push("/profile/edit")}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Edit className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* User Info */}
            <div className="space-y-3 border-t border-slate-200 pt-6">
              <div className="flex items-center space-x-3 space-x-reverse" dir="rtl">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1">شماره موبایل</p>
                  <p className="text-sm font-medium text-slate-900">{user.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 space-x-reverse" dir="rtl">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1">تاریخ عضویت</p>
                  <p className="text-sm font-medium text-slate-900">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">0</p>
              <p className="text-xs text-slate-600 mt-1" dir="rtl">آگهی‌های من</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <MessageCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">0</p>
              <p className="text-xs text-slate-600 mt-1" dir="rtl">گفتگوها</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">0</p>
              <p className="text-xs text-slate-600 mt-1" dir="rtl">علاقه‌مندی‌ها</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4" dir="rtl">دسترسی سریع</h2>
            <div className="space-y-2">
              <button
                onClick={() => router.push("/create-ad")}
                className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors text-right"
                dir="rtl"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">آگهی‌های من</p>
                    <p className="text-xs text-slate-600">مدیریت و مشاهده آگهی‌های شما</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push("/messages")}
                className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors text-right"
                dir="rtl"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">گفتگوها</p>
                    <p className="text-xs text-slate-600">پیام‌های دریافتی و ارسالی</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push("/cart")}
                className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors text-right"
                dir="rtl"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">علاقه‌مندی‌ها</p>
                    <p className="text-xs text-slate-600">آگهی‌های ذخیره شده</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 space-x-reverse px-6 py-3 border-2 border-red-300 rounded-lg hover:bg-red-50 transition-colors text-red-600 font-medium"
            dir="rtl"
          >
            <LogOut className="w-5 h-5" />
            <span>خروج از حساب کاربری</span>
          </button>
        </motion.div>
      </main>
    </>
  );
}
