import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { getSetting, getSettings, upsertSetting } from "@/lib/settings";
import { isAdminSession } from "@/lib/auth-session";
import { revalidateSettingsCache } from "@/lib/revalidate-cache";
import {
  AD_POSITIONS,
  hasUniqueAdPositions,
  normalizeAdSenseClientId,
  normalizeAdSenseSlotId,
} from "@/lib/adsense";

async function checkAdmin(): Promise<boolean> {
  const headersList = await headers();
  return isAdminSession(headersList.get("cookie"));
}

const linksSchema = z.object({
  github: z.string().trim().optional(),
  linkedin: z.string().trim().optional(),
  contactEmail: z.string().trim().optional(),
  twitter: z.string().trim().optional(),
});

const brandingSchema = z.object({
  logoUrl: z.string().trim().optional(),
  faviconUrl: z.string().trim().optional(),
  avatarUrl: z.string().trim().optional(),
  siteName: z.string().trim().min(1),
  shortBio: z.string().trim().optional(),
  displayName: z.string().trim().optional(),
  roleLocation: z.string().trim().optional(),
});

const appearanceSchema = z.object({
  fontPair: z.string().trim().min(1),
  colorPreset: z.string().trim().min(1),
  customPrimaryOklch: z.string().trim().optional(),
});

const adSlotSchema = z
  .object({
    slotId: z
      .string()
      .trim()
      .refine((value) => !value || Boolean(normalizeAdSenseSlotId(value)), {
        message: "AdSense slot ID must contain exactly 10 digits",
      }),
    position: z.enum(AD_POSITIONS),
    enabled: z.boolean(),
  })
  .refine(
    (slot) => !slot.enabled || Boolean(normalizeAdSenseSlotId(slot.slotId)),
    {
      message: "Enabled ad slots require a valid slot ID",
      path: ["slotId"],
    },
  );

const adsSchema = z.object({
  clientId: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || Boolean(normalizeAdSenseClientId(value)), {
      message:
        "AdSense client ID must use the format ca-pub- followed by 16 digits",
    }),
  slots: z
    .array(adSlotSchema)
    .max(AD_POSITIONS.length)
    .refine(hasUniqueAdPositions, {
      message: "Ad slot positions must be unique",
    }),
});

const pagesSchema = z.object({
  about: z.string().optional(),
  privacy: z.string().optional(),
  contact: z.string().optional(),
  disclaimer: z.string().optional(),
});

const aiSchema = z.object({
  providerOrder: z.array(z.enum(["claude", "openai", "groq"])).min(1),
  claudeModel: z.string().trim().min(1),
  openaiModel: z.string().trim().min(1),
  groqModel: z.string().trim().min(1),
  imageModel: z.string().trim().min(1),
  claudeSystemPrompt: z.string().trim().min(1),
  groqSystemPrompt: z.string().trim().min(1),
  userMessageTemplate: z.string().trim().min(1),
  groqUserMessageTemplate: z.string().trim().min(1),
  imagePromptTemplate: z.string().trim().min(1),
});

const settingSchemas = {
  links: linksSchema,
  branding: brandingSchema,
  appearance: appearanceSchema,
  ads: adsSchema,
  pages: pagesSchema,
  ai: aiSchema,
} as const;

const bodySchema = z.object({
  key: z.enum(["links", "branding", "appearance", "ads", "pages", "ai"]),
  value: z.unknown(),
});

export async function GET() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getSettings();
  const { admin_password_hash: _adminPasswordHash, ...publicSettings } =
    settings;
  return NextResponse.json(publicSettings);
}

export async function POST(request: Request) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsedBody = bodySchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsedBody.error.flatten() },
      { status: 400 },
    );
  }

  const { key, value } = parsedBody.data;
  const parsedValue = settingSchemas[key].safeParse(value);

  if (!parsedValue.success) {
    return NextResponse.json(
      {
        error: `Invalid ${key} settings`,
        details: parsedValue.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    await upsertSetting(key, parsedValue.data);
  } catch (error) {
    Sentry.captureException(error, { extra: { settingsKey: key } });
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 },
    );
  }

  revalidateSettingsCache();
  const savedSetting = await getSetting(key);
  return NextResponse.json({ key, value: savedSetting });
}
