import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { isAdminSession } from "@/lib/auth-session";
import { getClientIdentifier, rateLimit } from "@/lib/rate-limit";
import {
  createContentIdeaInDb,
  getContentIdeasFromDb,
} from "@/lib/db-content-ideas";

async function checkAdmin(): Promise<boolean> {
  const headersList = await headers();
  return isAdminSession(headersList.get("cookie"));
}

const ideaSchema = z.object({
  title: z.string().min(1).max(180),
  notes: z.string().max(5000).optional(),
  category: z.enum(["Life", "Work", "Hobbies", "Experience"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z
    .enum(["idea", "planned", "generated", "published", "archived"])
    .optional(),
  targetPublishAt: z.string().nullable().optional(),
});

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ideas: await getContentIdeasFromDb() });
}

export async function POST(request: Request) {
  const clientId = getClientIdentifier(request);
  const limit = rateLimit({
    key: `content-ideas:write:${clientId}`,
    windowMs: 10 * 60 * 1000,
    maxRequests: 30,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many idea updates. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = ideaSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid idea data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const idea = await createContentIdeaInDb(parsed.data);
  if (!idea) {
    return NextResponse.json(
      {
        error:
          "Failed to save idea. Ensure the database migration has been applied.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ idea });
}
