"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  Search, 
  Filter, 
  MapPin, 
  Menu, 
  X, 
  User, 
  LogIn, 
  UserPlus,
  ChevronDown,
  Home,
  Car,
  Shirt,
  Smartphone,
  Sofa,
  Briefcase,
  GraduationCap,
  Heart,
  Gamepad2,
  Dumbbell,
  Factory,
  Baby
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface City {
  name: string;
  province: string;
}

const categories: Category[] = [
  { id: "real-estate", name: "مسکن و املاک", icon: <Home className="w-5 h-5" /> },
  { id: "vehicles", name: "خودرو و موتورسیکلت", icon: <Car className="w-5 h-5" /> },
  { id: "clothing", name: "کفش و پوشاک", icon: <Shirt className="w-5 h-5" /> },
  { id: "electronics", name: "لوازم الکترونیکی و موبایل", icon: <Smartphone className="w-5 h-5" /> },
  { id: "home", name: "خانه و آشپزخانه", icon: <Sofa className="w-5 h-5" /> },
  { id: "jobs", name: "استخدام و خدمات", icon: <Briefcase className="w-5 h-5" /> },
  { id: "education", name: "آموزش", icon: <GraduationCap className="w-5 h-5" /> },
  { id: "pets", name: "حیوانات خانگی", icon: <Heart className="w-5 h-5" /> },
  { id: "entertainment", name: "سرگرمی و هنر", icon: <Gamepad2 className="w-5 h-5" /> },
  { id: "sports", name: "ورزش و فراغت", icon: <Dumbbell className="w-5 h-5" /> },
  { id: "industrial", name: "تجهیزات صنعتی", icon: <Factory className="w-5 h-5" /> },
  { id: "baby", name: "لوازم کودک", icon: <Baby className="w-5 h-5" /> },
];

// لیست کامل شهرها و استان‌های ایران
const allCities: City[] = [
  // استان تهران
  { name: "تهران", province: "تهران" },
  { name: "اسلامشهر", province: "تهران" },
  { name: "کرج", province: "البرز" },
  { name: "هشتگرد", province: "البرز" },
  { name: "ساوجبلاغ", province: "البرز" },
  
  // استان اصفهان
  { name: "اصفهان", province: "اصفهان" },
  { name: "کاشان", province: "اصفهان" },
  { name: "نجف‌آباد", province: "اصفهان" },
  { name: "خمینی‌شهر", province: "اصفهان" },
  { name: "شاهین‌شهر", province: "اصفهان" },
  
  // استان خراسان رضوی
  { name: "مشهد", province: "خراسان رضوی" },
  { name: "نیشابور", province: "خراسان رضوی" },
  { name: "سبزوار", province: "خراسان رضوی" },
  { name: "قوچان", province: "خراسان رضوی" },
  
  // استان فارس
  { name: "شیراز", province: "فارس" },
  { name: "مرودشت", province: "فارس" },
  { name: "جهرم", province: "فارس" },
  { name: "کازرون", province: "فارس" },
  
  // استان آذربایجان شرقی
  { name: "تبریز", province: "آذربایجان شرقی" },
  { name: "مراغه", province: "آذربایجان شرقی" },
  { name: "میانه", province: "آذربایجان شرقی" },
  
  // استان خوزستان
  { name: "اهواز", province: "خوزستان" },
  { name: "آبادان", province: "خوزستان" },
  { name: "خرمشهر", province: "خوزستان" },
  { name: "دزفول", province: "خوزستان" },
  
  // استان مازندران
  { name: "ساری", province: "مازندران" },
  { name: "بابل", province: "مازندران" },
  { name: "آمل", province: "مازندران" },
  { name: "قائم‌شهر", province: "مازندران" },
  
  // استان گیلان
  { name: "رشت", province: "گیلان" },
  { name: "انزلی", province: "گیلان" },
  { name: "لاهیجان", province: "گیلان" },
  
  // استان اردبیل
  { name: "اردبیل", province: "اردبیل" },
  { name: "پارس‌آباد", province: "اردبیل" },
  
  // استان همدان
  { name: "همدان", province: "همدان" },
  { name: "ملایر", province: "همدان" },
  
  // استان کرمان
  { name: "کرمان", province: "کرمان" },
  { name: "رفسنجان", province: "کرمان" },
  { name: "سیرجان", province: "کرمان" },
  
  // استان یزد
  { name: "یزد", province: "یزد" },
  { name: "اردکان", province: "یزد" },
  
  // استان قم
  { name: "قم", province: "قم" },
  
  // استان قزوین
  { name: "قزوین", province: "قزوین" },
  
  // استان زنجان
  { name: "زنجان", province: "زنجان" },
  
  // استان کردستان
  { name: "سنندج", province: "کردستان" },
  { name: "مریوان", province: "کردستان" },
  
  // استان لرستان
  { name: "خرم‌آباد", province: "لرستان" },
  { name: "بروجرد", province: "لرستان" },
  
  // استان ایلام
  { name: "ایلام", province: "ایلام" },
  
  // استان بوشهر
  { name: "بوشهر", province: "بوشهر" },
  { name: "برازجان", province: "بوشهر" },
  
  // استان بندرعباس
  { name: "بندرعباس", province: "هرمزگان" },
  { name: "قشم", province: "هرمزگان" },
  
  // استان کرمانشاه
  { name: "کرمانشاه", province: "کرمانشاه" },
  
  // استان ارومیه
  { name: "ارومیه", province: "آذربایجان غربی" },
  { name: "خوی", province: "آذربایجان غربی" },
  
  // استان سمنان
  { name: "سمنان", province: "سمنان" },
  { name: "شاهرود", province: "سمنان" },
  
  // استان گرگان
  { name: "گرگان", province: "گلستان" },
  { name: "گنبد کاووس", province: "گلستان" },
  
  // استان یاسوج
  { name: "یاسوج", province: "کهگیلویه و بویراحمد" },
  
  // استان زاهدان
  { name: "زاهدان", province: "سیستان و بلوچستان" },
  { name: "چابهار", province: "سیستان و بلوچستان" },
  
  // استان بیرجند
  { name: "بیرجند", province: "خراسان جنوبی" },
  
  // استان بجنورد
  { name: "بجنورد", province: "خراسان شمالی" },
];

const provinces = Array.from(new Set(allCities.map(city => city.province))).sort();

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("تهران");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // فیلتر شهرها بر اساس جستجو و استان
  const filteredCities = allCities.filter(city => {
    const matchesSearch = city.name.includes(citySearchQuery) || city.province.includes(citySearchQuery);
    const matchesProvince = !selectedProvince || city.province === selectedProvince;
    return matchesSearch && matchesProvince;
  });

  // بستن dropdown با کلیک خارج از آن
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
        setCitySearchQuery("");
        setSelectedProvince(null);
      }
    };

    if (showCityDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCityDropdown]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - Right Side (RTL) */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center space-x-2 space-x-reverse cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BazaarChi
              </span>
            </div>
          </div>

          {/* Search Bar - Center */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full flex items-center">
              <div className="absolute right-3 z-10">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="در همه آگهی‌ها جستجو کنید..."
                className="w-full pr-12 pl-32 py-3 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                dir="rtl"
              />
              <div className="absolute left-3 flex items-center space-x-2 space-x-reverse" ref={cityDropdownRef}>
                <button
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  className="flex items-center space-x-1 space-x-reverse px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-sm text-slate-700 border border-slate-300 bg-white"
                  dir="rtl"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="max-w-[80px] truncate">{selectedCity}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showCityDropdown && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl min-w-[320px] max-h-[500px] overflow-hidden z-30">
                    {/* جستجوی شهر */}
                    <div className="p-3 border-b border-slate-200">
                      <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="جستجوی شهر یا استان..."
                          value={citySearchQuery}
                          onChange={(e) => setCitySearchQuery(e.target.value)}
                          className="w-full pr-10 pl-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          dir="rtl"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* فیلتر استان */}
                    {!citySearchQuery && (
                      <div className="p-3 border-b border-slate-200 max-h-[120px] overflow-y-auto">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setSelectedProvince(null)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                              !selectedProvince
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            همه استان‌ها
                          </button>
                          {provinces.slice(0, 10).map((province) => (
                            <button
                              key={province}
                              onClick={() => setSelectedProvince(province)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                selectedProvince === province
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              }`}
                            >
                              {province}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* لیست شهرها */}
                    <div className="max-h-[300px] overflow-y-auto">
                      {filteredCities.length > 0 ? (
                        filteredCities.map((city) => (
                          <button
                            key={`${city.province}-${city.name}`}
                            onClick={() => {
                              setSelectedCity(city.name);
                              setShowCityDropdown(false);
                              setCitySearchQuery("");
                              setSelectedProvince(null);
                            }}
                            className={`w-full text-right px-4 py-2.5 hover:bg-slate-50 transition-colors text-sm ${
                              selectedCity === city.name ? "bg-blue-50 text-blue-600 font-medium" : "text-slate-700"
                            }`}
                            dir="rtl"
                          >
                            <div className="flex items-center justify-between">
                              <span>{city.name}</span>
                              <span className="text-xs text-slate-400 mr-2">{city.province}</span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-slate-500 text-sm">
                          نتیجه‌ای یافت نشد
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button className="absolute left-20 flex items-center space-x-1 space-x-reverse px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors text-sm font-medium shadow-sm">
                <Filter className="w-4 h-4" />
                <span>فیلتر</span>
              </button>
            </div>
          </div>

          {/* Auth Buttons / User Menu - Left Side */}
          <div className="flex items-center space-x-3 space-x-reverse">
            {user ? (
              <div className="flex items-center space-x-3 space-x-reverse">
                <button
                  onClick={() => router.push("/profile")}
                  className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center hover:ring-2 ring-blue-500 transition-all"
                >
                  <User className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={logout}
                  className="hidden md:flex items-center space-x-1 space-x-reverse px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                >
                  <span>خروج</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden md:flex items-center space-x-1 space-x-reverse px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                >
                  <LogIn className="w-4 h-4" />
                  <span>ورود</span>
                </Link>
                <Link
                  href="/register"
                  className="hidden md:flex items-center space-x-1 space-x-reverse px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>ثبت‌نام</span>
                </Link>
              </>
            )}
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="در همه آگهی‌ها جستجو کنید..."
              className="w-full pr-12 pl-4 py-3 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex items-center space-x-1 space-x-reverse py-3 min-w-max">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    activeCategory === category.id
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                  dir="rtl"
                >
                  <span className={activeCategory === category.id ? "text-blue-600" : "text-slate-500"}>
                    {category.icon}
                  </span>
                  <span className="text-sm font-medium">{category.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-slate-200 bg-white overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              {/* City Selection */}
              <div className="pt-3 border-t border-slate-200">
                <div className="relative mb-3" ref={cityDropdownRef}>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="جستجوی شهر..."
                      value={citySearchQuery}
                      onChange={(e) => setCitySearchQuery(e.target.value)}
                      className="w-full pr-10 pl-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      dir="rtl"
                    />
                  </div>
                  {citySearchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-[200px] overflow-y-auto z-20">
                      {filteredCities.slice(0, 10).map((city) => (
                        <button
                          key={`${city.province}-${city.name}`}
                          onClick={() => {
                            setSelectedCity(city.name);
                            setCitySearchQuery("");
                          }}
                          className={`w-full text-right px-4 py-2 hover:bg-slate-50 text-sm ${
                            selectedCity === city.name ? "bg-blue-50 text-blue-600 font-medium" : "text-slate-700"
                          }`}
                          dir="rtl"
                        >
                          {city.name} - {city.province}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-2" dir="rtl">شهر انتخاب شده: <span className="font-medium text-slate-700">{selectedCity}</span></p>
              </div>

              {/* Categories in Mobile */}
              <div className="pt-3 border-t border-slate-200">
                <p className="text-sm font-medium text-slate-700 mb-3" dir="rtl">دسته‌بندی‌ها:</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveCategory(category.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg transition-all text-sm ${
                        activeCategory === category.id
                          ? "bg-blue-50 text-blue-600 border border-blue-200"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                      dir="rtl"
                    >
                      <span className={activeCategory === category.id ? "text-blue-600" : "text-slate-500"}>
                        {category.icon}
                      </span>
                      <span className="font-medium">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
