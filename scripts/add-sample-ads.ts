import fs from "fs";
import path from "path";

const ADS_FILE = path.join(process.cwd(), "data", "ads.json");

const sampleAds = [
  {
    id: "sample_1",
    userId: "user_09123456789",
    title: "آیفون 13 پرو 256 گیگابایت",
    description: "آیفون 13 پرو با حافظه 256 گیگابایت، رنگ آبی، در حد نو و بدون هیچ خرابی. تمام لوازم اصلی موجود است. قیمت توافقی.",
    price: 45000000,
    category: "لوازم الکترونیکی و موبایل",
    city: "تهران",
    phone: "09123456789",
    images: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sample_2",
    userId: "user_09123456790",
    title: "ماشین لباسشویی سامسونگ 8 کیلویی",
    description: "ماشین لباسشویی سامسونگ مدل WW80J5455EW با ظرفیت 8 کیلوگرم، کاملاً سالم و در حال استفاده. دارای گارانتی و تمام لوازم.",
    price: 12000000,
    category: "خانه و آشپزخانه",
    city: "اصفهان",
    phone: "09123456790",
    images: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sample_3",
    userId: "user_09123456791",
    title: "آپارتمان 100 متری در منطقه 2",
    description: "آپارتمان 100 متری در منطقه 2 تهران، طبقه 3، 2 خوابه، دارای پارکینگ و انباری. موقعیت عالی و دسترسی آسان به مترو.",
    price: 3500000000,
    category: "مسکن و املاک",
    city: "تهران",
    phone: "09123456791",
    images: [],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sample_4",
    userId: "user_09123456792",
    title: "موتورسیکلت هوندا CBR 250",
    description: "موتورسیکلت هوندا CBR 250 مدل 2020، رنگ قرمز، کارکرد 15000 کیلومتر. تمام سرویس‌ها انجام شده و کاملاً سالم است.",
    price: 85000000,
    category: "خودرو و موتورسیکلت",
    city: "مشهد",
    phone: "09123456792",
    images: [],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sample_5",
    userId: "user_09123456793",
    title: "کفش نایک ورزشی سایز 42",
    description: "کفش نایک ورزشی مدل Air Max، سایز 42، رنگ مشکی و سفید. استفاده شده اما در شرایط خوب. مناسب برای دویدن و ورزش.",
    price: 2500000,
    category: "کفش و پوشاک",
    city: "شیراز",
    phone: "09123456793",
    images: [],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function addSampleAds() {
  // Ensure data directory exists
  const dataDir = path.dirname(ADS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Read existing ads
  let existingAds: any[] = [];
  if (fs.existsSync(ADS_FILE)) {
    try {
      const data = fs.readFileSync(ADS_FILE, "utf-8");
      existingAds = JSON.parse(data);
    } catch (error) {
      console.error("Error reading ads file:", error);
    }
  }

  // Remove existing sample ads
  existingAds = existingAds.filter((ad) => !ad.id.startsWith("sample_"));

  // Add new sample ads
  const allAds = [...sampleAds, ...existingAds];

  // Write to file
  fs.writeFileSync(ADS_FILE, JSON.stringify(allAds, null, 2));
  console.log(`✅ ${sampleAds.length} آگهی نمونه اضافه شد`);
}

addSampleAds();


