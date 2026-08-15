import { NextResponse } from "next/server";
import { getPostSummariesFromDb } from "@/lib/db-posts";
import { getPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.maplehub.cloud";

export async function GET() {
  const posts = getPublishedPosts(await getPostSummariesFromDb());
  const destination = posts.length
    ? `/blog/${posts[Math.floor(Math.random() * posts.length)].slug}`
    : "/blog";
  const response = NextResponse.redirect(new URL(destination, BASE_URL), 307);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
