const HOST_LABEL_PATTERN =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export class InvalidHostnameError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "InvalidHostnameError";
  }
}

/**
 * Normalize a host, hostname, or absolute URL to a lowercase DNS hostname.
 *
 * Ports and one trailing dot are removed. Paths, credentials, whitespace,
 * malformed labels, and empty values are rejected.
 */
export function normalizeHostname(input: string): string {
  const candidate = input.trim();

  if (candidate.length === 0) {
    throw new InvalidHostnameError("Hostname is empty.");
  }

  if (/\s/.test(candidate)) {
    throw new InvalidHostnameError("Hostname contains whitespace.");
  }

  let parsed: URL;

  try {
    parsed = candidate.includes("://")
      ? new URL(candidate)
      : new URL(`http://${candidate}`);
  } catch {
    throw new InvalidHostnameError("Hostname is malformed.");
  }

  if (parsed.username !== "" || parsed.password !== "") {
    throw new InvalidHostnameError("Hostname must not contain credentials.");
  }

  if (parsed.pathname !== "/" || parsed.search !== "" || parsed.hash !== "") {
    throw new InvalidHostnameError("Hostname must not contain a path or query.");
  }

  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");

  if (!HOST_LABEL_PATTERN.test(hostname)) {
    throw new InvalidHostnameError("Hostname is not a valid DNS name.");
  }

  return hostname;
}
