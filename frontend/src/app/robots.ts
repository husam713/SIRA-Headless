import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { buildRobotsPolicy } from "@/lib/seo/discovery";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const hostname = (await headers()).get("host") ?? "";

  return buildRobotsPolicy(hostname);
}
