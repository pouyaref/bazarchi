"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import AdCard from "../components/AdCard";
import AdDetailModal from "../components/AdDetailModal";
import { Search, Filter } from "lucide-react";

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

export default function SearchPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = [
    "مسکن و املاک",
    "خودرو و موتورسیکلت",
    "کفش و پوشاک",
    "لوازم الکترونیکی و موبایل",
    "خانه و آشپزخانه",
    "استخدام و خدمات",
    "آموزش",
    "حیوانات خانگی",
    "سرگرمی و هنر",
    "ورزش و فراغت",
    "تجهیزات صنعتی",
    "لوازم کودک",
  ];

  const cities = ["تهران", "اصفهان", "مشهد", "شیراز", "تبریز", "کرج"];

  useEffect(() => {
    fetchAds();
  }, [searchQuery, selectedCategory, selectedCity]);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedCity) params.append("city", selectedCity);

      const response = await fetch(`/api/ads/list?${params.toString()}`);
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
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی آگهی..."
              className="w-full pr-12 pl-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              dir="rtl"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              dir="rtl"
            >
              <option value="">همه دسته‌بندی‌ها</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              dir="rtl"
            >
              <option value="">همه شهرها</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4" dir="rtl">
          <p className="text-slate-600">
            {isLoading ? "در حال جستجو..." : `${ads.length} آگهی یافت شد`}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : ads.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2" dir="rtl">نتیجه‌ای یافت نشد</h2>
            <p className="text-slate-600" dir="rtl">لطفاً فیلترهای جستجو را تغییر دهید</p>
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
