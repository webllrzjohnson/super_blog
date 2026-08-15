import { NextResponse, type NextRequest } from "next/server";
import { getPostSummariesFromDb } from "@/lib/db-posts";
import { getPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const posts = getPublishedPosts(await getPostSummariesFromDb());
  const destination = posts.length
    ? `/blog/${posts[Math.floor(Math.random() * posts.length)].slug}`
    : "/blog";
  const response = NextResponse.redirect(
    new URL(destination, request.url),
    307,
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}
