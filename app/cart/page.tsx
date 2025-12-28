"use client";

import Header from "../components/Header";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ShoppingCart, Heart } from "lucide-react";

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="flex items-center justify-between mb-6" dir="rtl">
          <h1 className="text-2xl font-bold">علاقه‌مندی‌ها و سبد خرید</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 space-x-reverse mb-4" dir="rtl">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold">سبد خرید</h2>
            </div>
            <p className="text-slate-600 text-center py-8" dir="rtl">
              سبد خرید شما خالی است
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 space-x-reverse mb-4" dir="rtl">
              <Heart className="w-6 h-6 text-red-500" />
              <h2 className="text-lg font-semibold">علاقه‌مندی‌ها</h2>
            </div>
            <p className="text-slate-600 text-center py-8" dir="rtl">
              هنوز آگهی‌ای به علاقه‌مندی‌ها اضافه نکرده‌اید
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

