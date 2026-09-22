import { notFound } from "next/navigation";

/**
 * The routes SIRA Digital does not have.
 *
 * The CMS compositions of the ADR-033 surface (`/work`, `/industries`) and
 * the shared newsroom exist for the other tenants; on Digital they would
 * render placeholder records inside a document designed to carry none. A 404
 * is the honest answer until the owner supplies that content.
 */
export function notFoundOnDigital(siteKey: string | null | undefined): void {
  if (siteKey === "digital") notFound();
}
