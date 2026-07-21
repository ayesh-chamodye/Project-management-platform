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

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [name, ...rest] = c.trim().split("=");
        return [name, rest.join("=")];
      })
    );
    const accessToken = cookies["sb-access-token"];
    if (!accessToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = parseJwt(accessToken);
    if (!payload || !payload.exp || Date.now() > payload.exp * 1000) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: { email: payload.email, id: payload.sub },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
