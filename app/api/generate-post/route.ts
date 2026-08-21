import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { isAdminSession } from "@/lib/auth-session";
import { generateAndSavePost, previewGeneratedPost } from "@/lib/generate-post";
import { getAiPromptPreset } from "@/lib/ai-prompt-presets";
import { AI_PROVIDER_LABELS } from "@/lib/ai-providers";
import { getClientIdentifier, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const clientId = getClientIdentifier(request);
  const limit = rateLimit({
    key: `generate-post:${clientId}`,
    windowMs: 10 * 60 * 1000,
    maxRequests: 5,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many generation requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const headersList = await headers();
  if (!(await isAdminSession(headersList.get("cookie")))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const topic = String(formData.get("topic") ?? "").trim();
  const context = String(formData.get("context") ?? "").trim();
  const schedule = String(formData.get("schedule") ?? "Immediate").trim();
  const mode = String(formData.get("mode") ?? "save").trim();
  const promptPreset = getAiPromptPreset(
    String(formData.get("promptPreset") ?? ""),
  ).id;
  const featuredImage = formData.get("featured_image");

  if (mode === "preview") {
    const result = await previewGeneratedPost({
      topic,
      context,
      schedule,
      promptPreset,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      mode: "preview",
      message: `Preview generated with ${AI_PROVIDER_LABELS[result.model]}. Review it before saving.`,
      post: result.post,
      model: result.model,
      wordCount: result.wordCount,
      warnings: result.warnings,
      providerAttempts: result.providerAttempts,
    });
  }

  const result = await generateAndSavePost({
    topic,
    context,
    schedule,
    featuredImage: featuredImage instanceof File ? featuredImage : null,
    promptPreset,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: result.published
      ? `Post published with ${AI_PROVIDER_LABELS[result.model]}.`
      : `Draft saved with ${AI_PROVIDER_LABELS[result.model]}. Review it in the admin dashboard.`,
    slug: result.post.slug,
    status: result.post.status,
    wordCount: result.wordCount,
    warnings: result.warnings,
    providerAttempts: result.providerAttempts,
  });
}
