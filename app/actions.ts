"use server"

import { cookies } from "next/headers";

export async function saveRegistration(data: any) {
  try {
    console.log("Processing database save for:", data);
    
    const response = await fetch('https://clkovxgt00.execute-api.us-east-1.amazonaws.com/jjo-api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    return { success: true, message: "Registration saved successfully" };
  } catch (error) {
    console.error("Database save failed:", error);
    return { success: false, message: "Failed to save registration" };
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

export async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value;
}