import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "خروج موفق" });
  
  // Clear auth token cookie
  response.cookies.set("auth_token", "", {
    expires: new Date(0),
    path: "/",
  });

  return response;
}


