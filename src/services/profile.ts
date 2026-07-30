import { callEdge } from "./tiktok-creator";
import type { CreatorProfile } from "@/types/creator";

/**
 * Get Creator Profile — /affiliate_creator/202508/profiles
 * Edge fn: `creator-get-profile`.
 */
export async function fetchCreatorProfile(signal?: AbortSignal): Promise<CreatorProfile> {
  return callEdge<CreatorProfile>("creator-get-profile", {}, signal);
}
