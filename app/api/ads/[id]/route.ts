import { NextRequest, NextResponse } from "next/server";
import { getAdById } from "@/lib/ads";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const ad = getAdById(resolvedParams.id);

    if (!ad) {
      return NextResponse.json(
        { success: false, message: "آگهی یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ad,
    });
  } catch (error) {
    console.error("Get ad error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}

