import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { buildSitemap } from "@/lib/seo/discovery";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hostname = (await headers()).get("host") ?? "";

  return buildSitemap(hostname);
}
