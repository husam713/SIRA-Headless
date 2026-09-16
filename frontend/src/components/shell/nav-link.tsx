import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

interface NavLinkProps {
  readonly href: string;
  readonly target?: string | null | undefined;
  readonly className?: string;
  readonly current?: boolean;
  readonly onClick?: NonNullable<ComponentProps<"a">["onClick"]>;
  readonly children: ReactNode;
}

function isInternal(href: string, target: string | null | undefined): boolean {
  return href.startsWith("/") && !href.startsWith("//") && (target === null || target === undefined || target === "_self");
}

/**
 * A menu item from WordPress, rendered the fast way when it can be.
 *
 * An internal path becomes `next/link`: the route is prefetched when the link
 * enters the viewport and the navigation swaps the page in place, keeping the
 * shell and the router cache — the difference between a site that feels like
 * one place and a sequence of documents. Anything else (another tenant's
 * hostname, an external site, a new-tab target) stays a plain anchor, which is
 * also what makes the cross-document View Transition cover it.
 */
export function NavLink({ href, target, className, current, onClick, children }: NavLinkProps) {
  const ariaCurrent = current ? ("page" as const) : undefined;

  if (isInternal(href, target)) {
    return (
      <Link
        href={href}
        className={className}
        aria-current={ariaCurrent}
        {...(onClick === undefined ? {} : { onClick })}
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={className}
      aria-current={ariaCurrent}
      {...(onClick === undefined ? {} : { onClick })}
      target={target ?? undefined}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}
