import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

async function source(file: string) {
  return readFile(path.join(process.cwd(), file), "utf8");
}

describe("existing-post AI hero image generation", () => {
  it("keeps the generation action available in the post editor", async () => {
    const editor = await source("components/admin/post-editor.tsx");

    expect(editor).toContain("const [generatingImage, setGeneratingImage]");
    expect(editor).toContain("const handleGenerateImage = async () =>");
    expect(editor).toContain('fetch("/api/generate-post-image"');
    expect(editor).toContain('aria-label="Generate featured image with AI"');
    expect(editor).toContain('generatingImage ? "Generating..." : "Generate"');
  });
});
