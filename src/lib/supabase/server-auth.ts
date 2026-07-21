import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "./server";

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getUserIdFromRequest(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [name, ...rest] = c.trim().split("=");
      return [name, rest.join("=")];
    })
  );
  const accessToken = cookies["sb-access-token"];
  if (!accessToken) return null;

  const payload = parseJwt(accessToken);
  if (!payload || !payload.exp || Date.now() > payload.exp * 1000) return null;

  return payload.sub;
}

export function requireAuthFromRequest(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) throw new Error("Unauthorized");
  return { id: userId };
}
