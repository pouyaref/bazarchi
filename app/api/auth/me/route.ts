import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getUserById } from "@/lib/auth";

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

    const user = getUserById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "کاربر یافت نشد" },
        { status: 404 }
      );
    }

    // Don't send password
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}

