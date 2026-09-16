/**
 * Remembers recently accepted event ids so a redelivered event is acknowledged
 * without doing its work twice.
 *
 * This is per process on purpose. Cache expiry is idempotent — expiring a tag
 * twice costs one extra refill at most — so a shared store would buy nothing
 * but a dependency. Replays outside the signature's freshness window are
 * refused before this is consulted; inside it, a duplicate that lands on
 * another Cloud Run instance simply expires that instance's cache too, which
 * is the behaviour a multi-instance deployment wants anyway.
 */

const DEFAULT_TTL_MS = 10 * 60 * 1000;
const DEFAULT_CAPACITY = 1000;

export class RecentEventIds {
  readonly #seen = new Map<string, number>();
  readonly #ttlMs: number;
  readonly #capacity: number;

  public constructor(ttlMs = DEFAULT_TTL_MS, capacity = DEFAULT_CAPACITY) {
    this.#ttlMs = ttlMs;
    this.#capacity = capacity;
  }

  /** True when the id was already recorded and has not expired. */
  public remember(eventId: string, now = Date.now()): boolean {
    this.#sweep(now);

    const expiresAt = this.#seen.get(eventId);
    if (expiresAt !== undefined && expiresAt > now) {
      return true;
    }

    if (this.#seen.size >= this.#capacity) {
      const oldest = this.#seen.keys().next().value;
      if (oldest !== undefined) this.#seen.delete(oldest);
    }

    this.#seen.set(eventId, now + this.#ttlMs);
    return false;
  }

  #sweep(now: number): void {
    for (const [id, expiresAt] of this.#seen) {
      if (expiresAt <= now) this.#seen.delete(id);
    }
  }
}

export const recentRevalidationEvents = new RecentEventIds();
