"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  Image, 
  Tag, 
  DollarSign, 
  MapPin, 
  FileText, 
  Camera,
  X,
  Plus
} from "lucide-react";

export default function CreateAdForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    city: "",
    phone: user?.phone || "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Redirect if not logged in
  if (!user) {
    router.push("/login");
    return null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages([...images, e.target.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "عنوان آگهی الزامی است";
    }

    if (!formData.description.trim()) {
      newErrors.description = "توضیحات الزامی است";
    }

    if (!formData.price.trim()) {
      newErrors.price = "قیمت الزامی است";
    }

    if (!formData.category) {
      newErrors.category = "دسته‌بندی الزامی است";
    }

    if (!formData.city) {
      newErrors.city = "شهر الزامی است";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSubmitError(null); // Clear any previous errors
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch("/api/ads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          city: formData.city,
          phone: formData.phone,
          images: images,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/");
      } else {
        setSubmitError(data.message || "خطا در ثبت آگهی");
      }
    } catch (err) {
      setSubmitError("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8"
    >
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 text-center" dir="rtl">
        ثبت آگهی جدید
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2" dir="rtl">
            تصاویر آگهی (حداکثر 5 تصویر)
          </label>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Camera className="w-8 h-8 text-slate-400" />
              </label>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2" dir="rtl">
            عنوان آگهی <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: آیفون 13 پرو"
              className={`w-full pr-12 pl-4 py-3 rounded-lg border ${
                errors.title ? "border-red-500" : "border-slate-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
              dir="rtl"
            />
          </div>
          {errors.title && <p className="mt-1 text-xs text-red-500" dir="rtl">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2" dir="rtl">
            توضیحات <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FileText className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="توضیحات کامل آگهی را بنویسید..."
              rows={5}
              className={`w-full pr-12 pl-4 py-3 rounded-lg border ${
                errors.description ? "border-red-500" : "border-slate-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
              dir="rtl"
            />
          </div>
          {errors.description && <p className="mt-1 text-xs text-red-500" dir="rtl">{errors.description}</p>}
        </div>

        {/* Price and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2" dir="rtl">
              قیمت (تومان) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value.replace(/\D/g, "") })}
                placeholder="1000000"
                className={`w-full pr-12 pl-4 py-3 rounded-lg border ${
                  errors.price ? "border-red-500" : "border-slate-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                dir="ltr"
              />
            </div>
            {errors.price && <p className="mt-1 text-xs text-red-500" dir="rtl">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2" dir="rtl">
              دسته‌بندی <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.category ? "border-red-500" : "border-slate-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
              dir="rtl"
            >
              <option value="">انتخاب کنید</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-500" dir="rtl">{errors.category}</p>}
          </div>
        </div>

        {/* City and Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2" dir="rtl">
              شهر <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={`w-full pr-12 pl-4 py-3 rounded-lg border ${
                  errors.city ? "border-red-500" : "border-slate-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                dir="rtl"
              >
                <option value="">انتخاب کنید</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            {errors.city && <p className="mt-1 text-xs text-red-500" dir="rtl">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2" dir="rtl">
              شماره تماس
            </label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 11) })}
                placeholder="09123456789"
                maxLength={11}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 text-center" dir="rtl">{submitError}</p>
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse shadow-lg"
          dir="rtl"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>در حال ثبت...</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>ثبت آگهی</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}

