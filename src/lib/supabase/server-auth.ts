import { NextResponse } from "next/server";

interface RequestLike {
  headers: {
    get(name: string): string | null;
  };
}

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

export function getRawUserFromRequest(request: RequestLike) {
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

  return payload;
}

export function getUserIdFromRequest(request: RequestLike) {
  const payload = getRawUserFromRequest(request);
  return payload ? payload.sub : null;
}

export function getUserFromRequest(request: RequestLike) {
  const payload = getRawUserFromRequest(request);
  if (!payload) return null;
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.user_metadata?.name || payload.name || null,
  };
}

export function requireAuthFromRequest(request: RequestLike) {
  const user = getUserFromRequest(request);
  if (!user) throw new Error("Unauthorized");
  return user;
}

export function unauthorizedResponse(message: string) {
  return NextResponse.json({ error: message }, { status: 401 });
}
