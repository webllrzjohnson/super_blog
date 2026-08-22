import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth-session";

export async function proxy(request: NextRequest) {
  const requestHost = (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    ""
  )
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();

  if (requestHost === "maplehub.cloud") {
    const url = new URL(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
      "https://www.maplehub.cloud",
    );
    return NextResponse.redirect(url, { status: 308 });
  }

  const articleMatch = request.nextUrl.pathname.match(/^\/blog\/([^/]+)$/);
  if (
    articleMatch &&
    articleMatch[1] !== "random" &&
    articleMatch[1] !== "tags"
  ) {
    const { getPostBySlugFromDb } = await import("@/lib/db-posts");
    const { isPostPubliclyVisible } = await import("@/lib/posts");
    const post = await getPostBySlugFromDb(articleMatch[1]);
    if (!post || !isPostPubliclyVisible(post)) {
      return NextResponse.rewrite(new URL("/_not-found", request.url), {
        status: 404,
      });
    }
  }

  const isAdmin = request.nextUrl.pathname.startsWith("/admin");

  if (!isAdmin) {
    return NextResponse.next();
  }

  // Allow admin login page and API routes
  if (
    request.nextUrl.pathname === "/admin" ||
    request.nextUrl.pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get("admin_session")?.value;
  const valid = session ? await verifySessionToken(session) : false;
  if (!valid) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
