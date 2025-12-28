import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getUserConversations } from "@/lib/messages";

export async function GET(request: NextRequest) {
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

    const conversations = getUserConversations(decoded.userId);

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}


