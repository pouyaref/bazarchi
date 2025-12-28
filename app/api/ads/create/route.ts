import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createAd } from "@/lib/ads";

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = cookieHeader
      ?.split(";")
      .find((c) => c.trim().startsWith("auth_token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "احراز هویت نشده" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (decoded.error || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: "توکن نامعتبر" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, price, category, city, phone, images } = body;

    // Validation
    if (!title || !description || !price || !category || !city) {
      return NextResponse.json(
        { success: false, message: "لطفاً تمام فیلدهای الزامی را پر کنید" },
        { status: 400 }
      );
    }

    const newAd = createAd({
      userId: decoded.userId,
      title,
      description,
      price: Number(price),
      category,
      city,
      phone: phone || "",
      images: images || [],
    });

    return NextResponse.json({
      success: true,
      message: "آگهی با موفقیت ثبت شد",
      ad: newAd,
    });
  } catch (error) {
    console.error("Create ad error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}


