import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SIRA_FONT_VARIABLE_CLASSES } from "../../../src/styles/fonts";
import "./prototype.css";

export const metadata: Metadata = {
  title: "SIRA Step 4 Art-Direction Prototype",
  description: "Non-production local visual prototype for design review.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrototypeLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={SIRA_FONT_VARIABLE_CLASSES}>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to prototype content
        </a>
        {children}
      </body>
    </html>
  );
}
