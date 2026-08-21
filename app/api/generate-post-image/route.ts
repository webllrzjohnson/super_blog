import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { isAdminSession } from "@/lib/auth-session";
import {
  buildPostImageAlt,
  buildPostImagePrompt,
} from "@/lib/generate-post-image-prompt";
import { getModelApiKey } from "@/lib/model-api-keys";
import { saveUploadedImageBuffer } from "@/lib/save-uploaded-image";
import { getSetting } from "@/lib/settings";

async function checkAdmin(): Promise<boolean> {
  const headersList = await headers();
  return isAdminSession(headersList.get("cookie"));
}

export async function POST(request: Request) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { topic } = await request.json();
  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  const apiKey = await getModelApiKey("openai");
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 },
    );
  }

  const ai = await getSetting("ai");
  const prompt = buildPostImagePrompt(topic, ai.imagePromptTemplate);
  const alt = buildPostImageAlt(topic);

  try {
    const headersList = await headers();
    const imageRes = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: ai.imageModel.trim() || "gpt-image-1",
          prompt,
          size: "1536x1024",
        }),
      },
    );

    if (!imageRes.ok) {
      const err = await imageRes.json().catch(() => ({}));
      throw new Error(err.error?.message || "OpenAI image generation failed");
    }

    const imageData = await imageRes.json();
    const b64 = imageData.data[0].b64_json;
    if (!b64) throw new Error("No image data returned");

    const binary = Buffer.from(b64, "base64");
    const uploaded = await saveUploadedImageBuffer(
      binary,
      "image/png",
      "generated",
      {
        requestOrigin: new URL(request.url).origin,
        forwardedHost:
          headersList.get("x-forwarded-host") ?? headersList.get("host"),
        forwardedProto: headersList.get("x-forwarded-proto"),
      },
    );
    return NextResponse.json({ url: uploaded.url, alt });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Image generation failed",
      },
      { status: 500 },
    );
  }
}
