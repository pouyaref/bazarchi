"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Header from "../../components/Header";
import { useAuth } from "@/lib/auth-context";
import {
  MapPin,
  Calendar,
  Phone,
  ArrowRight,
  MessageCircle,
  Tag,
  DollarSign,
  User,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface Ad {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  city: string;
  phone: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export default function AdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [ad, setAd] = useState<Ad | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchAd();
    }
  }, [params.id]);

  const fetchAd = async () => {
    try {
      const response = await fetch(`/api/ads/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setAd(data.ad);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching ad:", error);
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const handleMessageSeller = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    // Navigate to messages page with seller info
    router.push(`/messages?adId=${ad?.id}&sellerId=${ad?.userId}`);
  };

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

  if (!ad) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-2" dir="rtl">
              آگهی یافت نشد
            </h2>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 space-x-reverse mt-4 text-blue-600 hover:text-blue-700"
              dir="rtl"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>بازگشت به صفحه اصلی</span>
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 space-x-reverse mb-6 text-slate-600 hover:text-slate-900 transition-colors"
          dir="rtl"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>بازگشت</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              {/* Main Image */}
              <div className="relative w-full h-96 md:h-[500px] bg-slate-200">
                {ad.images && ad.images.length > 0 && ad.images[selectedImageIndex] ? (
                  <>
                    <img
                      src={ad.images[selectedImageIndex]}
                      alt={ad.title}
                      className="w-full h-full object-contain bg-white"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                              <span class="text-slate-400 text-lg" dir="rtl">خطا در بارگذاری تصویر</span>
                            </div>
                          `;
                        }
                      }}
                    />
                    {/* Image Counter */}
                    {ad.images.length > 1 && (
                      <div className="absolute top-4 left-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                        {selectedImageIndex + 1} / {ad.images.length}
                      </div>
                    )}
                    {/* Navigation Arrows */}
                    {ad.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : ad.images.length - 1))}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                          dir="ltr"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSelectedImageIndex((prev) => (prev < ad.images.length - 1 ? prev + 1 : 0))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                          dir="ltr"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <span className="text-slate-400 text-lg" dir="rtl">
                      بدون تصویر
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {ad.images && ad.images.length > 1 && (
                <div className="p-4 border-t border-slate-200">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    {ad.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 aspect-square w-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index
                            ? "border-blue-600 ring-2 ring-blue-200"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${ad.title} - تصویر ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Ad Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 md:p-8"
            >
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900" dir="rtl">
                    {ad.title}
                  </h1>
                  <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-lg whitespace-nowrap mr-4" dir="rtl">
                    {ad.category}
                  </span>
                </div>

                <div className="flex items-center space-x-4 space-x-reverse text-slate-600 mb-6" dir="rtl">
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <MapPin className="w-5 h-5" />
                    <span>{ad.city}</span>
                  </div>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <Calendar className="w-5 h-5" />
                    <span>{formatDate(ad.createdAt)}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-blue-600 mb-2" dir="rtl">
                    {formatPrice(ad.price)} تومان
                  </h2>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4" dir="rtl">
                  توضیحات
                </h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap" dir="rtl">
                  {ad.description}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 sticky top-24"
            >
              {/* Contact Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4" dir="rtl">
                  اطلاعات تماس
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 space-x-reverse p-3 bg-slate-50 rounded-lg" dir="rtl">
                    <Phone className="w-5 h-5 text-slate-600" />
                    <span className="text-slate-700 font-medium">{ad.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse p-3 bg-slate-50 rounded-lg" dir="rtl">
                    <MapPin className="w-5 h-5 text-slate-600" />
                    <span className="text-slate-700">{ad.city}</span>
                  </div>
                </div>
              </div>

              {/* Message Button */}
              <motion.button
                onClick={handleMessageSeller}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 space-x-reverse shadow-lg mb-4"
                dir="rtl"
              >
                <MessageCircle className="w-5 h-5" />
                <span>پیام دادن به فروشنده</span>
              </motion.button>

              {/* Call Button */}
              <a
                href={`tel:${ad.phone}`}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 space-x-reverse shadow-lg block text-center"
                dir="rtl"
              >
                <Phone className="w-5 h-5" />
                <span>تماس با فروشنده</span>
              </a>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}

