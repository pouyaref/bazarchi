"use client";

import { useEffect, useState } from "react";
import Header from "./components/Header";
import AdCard from "./components/AdCard";
import AdDetailModal from "./components/AdDetailModal";
import { Package } from "lucide-react";

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

export default function Home() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await fetch("/api/ads/list");
      const data = await response.json();
      
      if (data.success) {
        setAds(data.ads);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdClick = (adId: string) => {
    setSelectedAdId(adId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAdId(null);
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="mb-6" dir="rtl">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">آگهی‌های جدید</h1>
          <p className="text-slate-600">جدیدترین آگهی‌های ثبت شده</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : ads.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2" dir="rtl">هنوز آگهی‌ای ثبت نشده</h2>
            <p className="text-slate-600" dir="rtl">اولین آگهی را شما ثبت کنید!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {ads.map((ad) => (
              <AdCard key={ad.id} ad={ad} onAdClick={handleAdClick} />
            ))}
          </div>
        )}
      </main>
      
      {/* Ad Detail Modal */}
      <AdDetailModal
        adId={selectedAdId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
