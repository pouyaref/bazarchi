import fs from "fs";
import path from "path";

// Use /tmp in Vercel (serverless) or data folder in local development
const getAdsFilePath = () => {
  if (process.env.VERCEL) {
    return path.join("/tmp", "ads.json");
  }
  return path.join(process.cwd(), "data", "ads.json");
};

const ADS_FILE = getAdsFilePath();

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
  const filePath = getAdsFilePath();
  const dataDir = path.dirname(filePath);
  
  // In Vercel /tmp, directory always exists, but check anyway
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (error) {
      // Directory might already exist or be /tmp which always exists
      console.log("Directory creation skipped:", error);
    }
  }
  
  if (!fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    } catch (error) {
      console.error("Error creating ads file:", error);
    }
  }
}

// Read ads from file
export function getAds(): Ad[] {
  ensureAdsFile();
  try {
    const filePath = getAdsFilePath();
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading ads file:", error);
    return [];
  }
}

// Write ads to file
function saveAds(ads: Ad[]) {
  ensureAdsFile();
  try {
    const filePath = getAdsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(ads, null, 2));
  } catch (error) {
    console.error("Error saving ads file:", error);
    throw error;
  }
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


