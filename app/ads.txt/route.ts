import { createAdsTxtResponse } from "@/lib/adsense";
import { getSetting } from "@/lib/settings";

export const revalidate = 120;

export async function GET() {
  const ads = await getSetting("ads");
  return createAdsTxtResponse(ads.clientId);
}
