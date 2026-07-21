import { NextResponse } from "next/server";

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

function getSessionFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [name, ...rest] = c.trim().split("=");
      return [name, rest.join("=")];
    })
  );
  const accessToken = cookies["sb-access-token"];
  let isAuthenticated = false;

  if (accessToken) {
    const payload = parseJwt(accessToken);
    if (payload && payload.exp) {
      isAuthenticated = Date.now() < payload.exp * 1000;
    }
  }

  return { isAuthenticated };
}

export async function proxy(request: Request) {
  const { isAuthenticated } = getSessionFromRequest(request);
  const url = new URL(request.url);
  const isOnAuthPage = url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/register") ||
    url.pathname.startsWith("/forgot-password");
  const isOnApiAuth = url.pathname.startsWith("/api/auth");
  const isOnAuthCallback = url.pathname.startsWith("/auth/callback");
  const isHomePage = url.pathname === "/";

  if (!isAuthenticated && !isOnAuthPage && !isOnApiAuth && !isOnAuthCallback && !isHomePage) {
    return NextResponse.redirect(new URL("/login", url));
  }

  if (isAuthenticated && (isOnAuthPage || isHomePage)) {
    return NextResponse.redirect(new URL("/dashboard", url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/[^?/]+|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"],
};
