import fs from "fs";
import path from "path";

const ADS_FILE = path.join(process.cwd(), "data", "ads.json");

export interface Ad {
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

// Initialize ads file if it doesn't exist
function ensureAdsFile() {
  const dataDir = path.dirname(ADS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(ADS_FILE)) {
    fs.writeFileSync(ADS_FILE, JSON.stringify([], null, 2));
  }
}

// Read ads from file
export function getAds(): Ad[] {
  ensureAdsFile();
  try {
    const data = fs.readFileSync(ADS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write ads to file
function saveAds(ads: Ad[]) {
  ensureAdsFile();
  fs.writeFileSync(ADS_FILE, JSON.stringify(ads, null, 2));
}

// Create new ad
export function createAd(adData: Omit<Ad, "id" | "createdAt" | "updatedAt">): Ad {
  const ads = getAds();
  
  const newAd: Ad = {
    ...adData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  ads.unshift(newAd); // Add to beginning (newest first)
  saveAds(ads);
  
  return newAd;
}

// Get ads by user ID
export function getAdsByUserId(userId: string): Ad[] {
  const ads = getAds();
  return ads.filter(ad => ad.userId === userId);
}

// Get ad by ID
export function getAdById(id: string): Ad | null {
  const ads = getAds();
  return ads.find(ad => ad.id === id) || null;
}

// Search ads
export function searchAds(query: {
  search?: string;
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
}): Ad[] {
  let ads = getAds();

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    ads = ads.filter(ad => 
      ad.title.toLowerCase().includes(searchLower) ||
      ad.description.toLowerCase().includes(searchLower)
    );
  }

  if (query.category) {
    ads = ads.filter(ad => ad.category === query.category);
  }

  if (query.city) {
    ads = ads.filter(ad => ad.city === query.city);
  }

  if (query.minPrice !== undefined) {
    ads = ads.filter(ad => ad.price >= query.minPrice!);
  }

  if (query.maxPrice !== undefined) {
    ads = ads.filter(ad => ad.price <= query.maxPrice!);
  }

  return ads;
}


