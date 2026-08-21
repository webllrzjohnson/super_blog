import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminSession } from "@/lib/auth-session";
import {
  deleteResourceFileFromDb,
  getResourceFilesFromDb,
  RESOURCE_FILE_CATEGORIES,
  saveUploadedResourceFile,
  updateResourceFileInDb,
  type ResourceFileCategory,
} from "@/lib/resource-files";
import { getClientIdentifier, rateLimit } from "@/lib/rate-limit";

async function checkAdmin(): Promise<boolean> {
  const headersList = await headers();
  return isAdminSession(headersList.get("cookie"));
}

const updateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(160).optional(),
  description: z.string().max(600).optional(),
  category: z.enum(RESOURCE_FILE_CATEGORIES).optional(),
  published: z.boolean().optional(),
});

const deleteSchema = z.object({
  id: z.string().min(1),
});

function parseCategory(value: FormDataEntryValue | null): ResourceFileCategory {
  return RESOURCE_FILE_CATEGORIES.includes(value as ResourceFileCategory)
    ? (value as ResourceFileCategory)
    : "Other";
}

export async function GET() {
  const isAdmin = await checkAdmin();
  const files = await getResourceFilesFromDb({ includeUnpublished: isAdmin });
  return NextResponse.json({ files });
}

export async function POST(request: Request) {
  const clientId = getClientIdentifier(request);
  const limit = rateLimit({
    key: `resource-files:write:${clientId}`,
    windowMs: 10 * 60 * 1000,
    maxRequests: 20,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many file updates. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const category = parseCategory(formData.get("category"));
    const published = formData.get("published") !== "false";
    const item = await saveUploadedResourceFile({
      file,
      title,
      description,
      category,
      published,
    });
    return NextResponse.json({ file: item });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to save resource file",
      },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid file update", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id, ...patch } = parsed.data;
  const file = await updateResourceFileInDb(id, patch);
  if (!file)
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  return NextResponse.json({ file });
}

export async function DELETE(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid delete request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const deleted = await deleteResourceFileFromDb(parsed.data.id);
  if (!deleted)
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
