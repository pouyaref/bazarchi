"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar } from "lucide-react";

interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  city: string;
  phone: string;
  images: string[];
  createdAt: string;
}

interface AdCardProps {
  ad: Ad;
  onAdClick?: (adId: string) => void;
}

export default function AdCard({ ad, onAdClick }: AdCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };
  
  const handleClick = () => {
    if (onAdClick) {
      onAdClick(ad.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "امروز";
    } else if (diffDays === 1) {
      return "دیروز";
    } else if (diffDays < 7) {
      return `${diffDays} روز پیش`;
    } else {
      return new Intl.DateTimeFormat("fa-IR", {
        month: "short",
        day: "numeric",
      }).format(date);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={handleClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden cursor-pointer h-full"
    >
        {/* Image */}
        <div className="relative w-full h-48 bg-slate-200">
          {ad.images && ad.images.length > 0 ? (
            <img
              src={ad.images[0]}
              alt={ad.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <span className="text-slate-400 text-sm" dir="rtl">بدون تصویر</span>
            </div>
          )}
          {ad.images && ad.images.length > 1 && (
            <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              +{ad.images.length - 1}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-1" dir="rtl">
            {ad.title}
          </h3>
          <p className="text-sm text-slate-600 mb-3 line-clamp-2" dir="rtl">
            {ad.description}
          </p>

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold text-blue-600" dir="rtl">
              {formatPrice(ad.price)} تومان
            </span>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded" dir="rtl">
              {ad.category}
            </span>
          </div>

          {/* Location and Date */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-200">
            <div className="flex items-center space-x-1 space-x-reverse" dir="rtl">
              <MapPin className="w-4 h-4" />
              <span>{ad.city}</span>
            </div>
            <div className="flex items-center space-x-1 space-x-reverse" dir="rtl">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(ad.createdAt)}</span>
            </div>
          </div>
        </div>
    </motion.div>
  );
}

