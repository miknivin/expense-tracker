// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {

  const response = NextResponse.json(
    { success: true, message: "Logged out successfully" },
    { status: 200 }
  );

  response.headers.set(
    "Set-Cookie",
    `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`
  );

  return response;
}
