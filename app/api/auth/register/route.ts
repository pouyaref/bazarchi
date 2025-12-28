import { NextRequest, NextResponse } from "next/server";
import { registerUser, verifyOTPAndRegister } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, name, otp, step } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "شماره موبایل الزامی است" },
        { status: 400 }
      );
    }

    // Step 1: Request OTP
    if (step === "request") {
      const result = await registerUser(phone, name);
      return NextResponse.json(result);
    }

    // Step 2: Verify OTP and register
    if (step === "verify") {
      if (!otp) {
        return NextResponse.json(
          { success: false, message: "کد تایید الزامی است" },
          { status: 400 }
        );
      }

      const result = await verifyOTPAndRegister(phone, otp, name);
      
      if (result.success && result.token) {
        const response = NextResponse.json(result);
        response.cookies.set("auth_token", result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: "/",
        });
        return response;
      }
      
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, message: "مرحله نامعتبر است" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}

