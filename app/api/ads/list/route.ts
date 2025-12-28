import { NextRequest, NextResponse } from "next/server";
import { getAds, searchAds } from "@/lib/ads";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const city = searchParams.get("city") || undefined;
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;

    let ads;

    if (search || category || city || minPrice !== undefined || maxPrice !== undefined) {
      ads = searchAds({ search, category, city, minPrice, maxPrice });
    } else {
      ads = getAds();
    }

    // Sort by newest first
    ads = ads.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Apply limit
    if (limit) {
      ads = ads.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      ads,
      count: ads.length,
    });
  } catch (error) {
    console.error("Get ads error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}


