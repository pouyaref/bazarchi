"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { X, MapPin, Calendar, Phone, MessageCircle, ArrowLeft, ArrowRight } from "lucide-react";

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

interface AdDetailModalProps {
  adId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdDetailModal({ adId, isOpen, onClose }: AdDetailModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [ad, setAd] = useState<Ad | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen && adId) {
      fetchAd();
      setSelectedImageIndex(0);
    } else {
      setAd(null);
    }
  }, [isOpen, adId]);

  const fetchAd = async () => {
    if (!adId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ads/${adId}`);
      const data = await response.json();

      if (data.success && data.ad) {
        setAd(data.ad);
      }
    } catch (error) {
      console.error("Error fetching ad:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "امروز";
    if (diffDays === 1) return "دیروز";
    if (diffDays < 7) return `${diffDays} روز پیش`;
    
    return new Intl.DateTimeFormat("fa-IR", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const handleMessageSeller = () => {
    if (!user) {
      onClose();
      router.push("/login");
      return;
    }
    
    if (!ad) return;
    
    // Just use adId, phone will be extracted from ad
    onClose();
    router.push(`/messages?adId=${ad.id}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900" dir="rtl">جزئیات آگهی</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : ad ? (
                <>
                  {/* Image */}
                  <div className="relative w-full h-64 bg-slate-100">
                    {ad.images && ad.images.length > 0 && ad.images[selectedImageIndex] ? (
                      <>
                        <img
                          src={ad.images[selectedImageIndex]}
                          alt={ad.title}
                          className="w-full h-full object-contain"
                        />
                        {ad.images.length > 1 && (
                          <>
                            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full" dir="rtl">
                              {selectedImageIndex + 1} / {ad.images.length}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : ad.images.length - 1));
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full"
                            >
                              <ArrowLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex((prev) => (prev < ad.images.length - 1 ? prev + 1 : 0));
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-slate-400" dir="rtl">بدون تصویر</span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {ad.images && ad.images.length > 1 && (
                    <div className="p-3 border-b border-slate-200 bg-slate-50">
                      <div className="flex gap-2 overflow-x-auto">
                        {ad.images.map((img, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageIndex(index);
                            }}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                              selectedImageIndex === index
                                ? "border-blue-600"
                                : "border-slate-300"
                            }`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Details */}
                  <div className="p-6 space-y-4">
                    {/* Title & Price */}
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h1 className="text-2xl font-bold text-slate-900 flex-1" dir="rtl">
                          {ad.title}
                        </h1>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded mr-2" dir="rtl">
                          {ad.category}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-3" dir="rtl">
                        {formatPrice(ad.price)} تومان
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600" dir="rtl">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{ad.city}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(ad.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="border-t border-slate-200 pt-4">
                      <h3 className="font-semibold text-slate-900 mb-2" dir="rtl">توضیحات</h3>
                      <p className="text-slate-700 leading-relaxed text-sm" dir="rtl">
                        {ad.description}
                      </p>
                    </div>

                    {/* Contact */}
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex items-center gap-2 mb-4" dir="rtl">
                        <Phone className="w-5 h-5 text-slate-600" />
                        <span className="text-slate-700 font-medium">{ad.phone}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-slate-600" dir="rtl">خطا در بارگذاری اطلاعات</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {ad && (
              <div className="border-t border-slate-200 p-4 bg-slate-50">
                <div className="flex gap-3">
                  <motion.button
                    onClick={handleMessageSeller}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                    dir="rtl"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>پیام دادن</span>
                  </motion.button>
                  <a
                    href={`tel:${ad.phone}`}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 text-center"
                    dir="rtl"
                  >
                    <Phone className="w-5 h-5" />
                    <span>تماس</span>
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
