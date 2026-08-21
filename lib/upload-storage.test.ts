import { describe, expect, it } from "vitest";

import { publicUploadUrl, resolveUploadDir } from "./upload-storage";

describe("upload storage helpers", () => {
  it("uses a local public/uploads directory outside production when no upload dir is configured", () => {
    expect(resolveUploadDir({ cwd: "/repo", nodeEnv: "development" })).toMatch(
      /[\\/]repo[\\/]public[\\/]uploads$/,
    );
  });

  it("keeps the container upload directory in production", () => {
    expect(resolveUploadDir({ cwd: "/repo", nodeEnv: "production" })).toBe(
      "/app/public/uploads",
    );
  });

  it("uses the public site URL before an internal request origin", () => {
    expect(
      publicUploadUrl("image.png", {
        requestOrigin: "https://localhost:3000",
        siteUrl: "https://www.maplehub.cloud",
      }),
    ).toBe("https://www.maplehub.cloud/api/uploads/image.png");
  });

  it("falls back to forwarded host before localhost request origin", () => {
    expect(
      publicUploadUrl("image.png", {
        requestOrigin: "https://localhost:3000",
        forwardedHost: "www.maplehub.cloud",
        forwardedProto: "https",
      }),
    ).toBe("https://www.maplehub.cloud/api/uploads/image.png");
  });
});
