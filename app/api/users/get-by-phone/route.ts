import { NextRequest, NextResponse } from "next/server";
import { getUserByPhone } from "@/lib/auth";
import { getAdById } from "@/lib/ads";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get("phone");
    const adId = searchParams.get("adId");

    if (adId) {
      // If adId is provided, get userId from ad
      const ad = getAdById(adId);
      if (ad) {
        // Try to find user by phone from ad
        if (ad.phone) {
          const user = getUserByPhone(ad.phone);
          if (user) {
            return NextResponse.json({
              success: true,
              userId: user.id,
            });
          }
        }
        // If user not found by phone, return ad.userId as fallback
        return NextResponse.json({
          success: true,
          userId: ad.userId,
        });
      }
    }

    if (phone) {
      const user = getUserByPhone(phone);
      if (user) {
        return NextResponse.json({
          success: true,
          userId: user.id,
        });
      }
    }

    return NextResponse.json(
      { success: false, message: "کاربر یافت نشد" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Get user by phone error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}


