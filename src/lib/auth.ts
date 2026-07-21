import { NextRequest, NextResponse } from "next/server";

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

export function requireAuth(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [name, ...rest] = c.trim().split("=");
      return [name, rest.join("=")];
    })
  );
  const accessToken = cookies["sb-access-token"];
  const payload = accessToken ? parseJwt(accessToken) : null;
  const email = payload?.email || "";
  const name = payload?.user_metadata?.name || email?.split("@")[0] || "";

  return { id: userId, email, name };
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export async function requireAuthOrRespond(request: NextRequest) {
  try {
    return { user: requireAuth(request), response: null as ReturnType<typeof unauthorizedResponse> | null };
  } catch {
    return { user: null as any, response: unauthorizedResponse() };
  }
}
