/**
 * The routing field — SIRA Digital's signature.
 *
 * One continuous line that turns at right angles is the grammar of the SIRA
 * mark. Here it becomes a living system: routes start at the reading edge of a
 * grid, travel forward, turn, avoid each other, and stop, leaving a node where
 * they end. In Arabic the same field runs right-to-left. On the client the
 * routes also bend around the pointer, so the system visibly responds to the
 * person in front of it.
 *
 * Everything here is pure and deterministic for a seed, so the server renders a
 * still of the same system as SVG (visible before any JavaScript, and the whole
 * picture when motion is reduced), and the client continues it on a canvas.
 * Coordinates are grid cells; the renderers scale them.
 */

export type FieldDirection = "ltr" | "rtl";

export interface FieldPoint {
  readonly x: number;
  readonly y: number;
}

export interface FieldRoute {
  readonly id: number;
  /** Cell corners the route has visited, in order. */
  readonly points: FieldPoint[];
  readonly bornTick: number;
  /** Set once the route stops; the renderer fades it from here. */
  doneTick: number | null;
}

export interface FieldConfig {
  readonly cols: number;
  readonly rows: number;
  readonly seed: number;
  readonly direction: FieldDirection;
  /** Routes alive at once. */
  readonly maxRoutes: number;
  /** Chance per tick that an unblocked route turns rather than continues. */
  readonly turnChance: number;
  readonly minLength: number;
  readonly maxLength: number;
  /** Chance per tick that a new route starts, when there is room. */
  readonly spawnChance: number;
  /** Ticks a finished route stays before its cells are released. */
  readonly linger: number;
  /**
   * Cell rectangles routes may not enter — the headline sits in one, so the
   * system visibly flows around the words rather than under them.
   */
  readonly obstacles?: readonly FieldRect[];
}

export interface FieldRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Something routes steer toward but may not enter — the pointer. */
export interface FieldAttractor {
  readonly x: number;
  readonly y: number;
  /** Cells within this distance are blocked, so routes bend around it. */
  readonly radius: number;
  /** Cells within this distance are steered toward it. */
  readonly reach: number;
}

export interface Field {
  readonly config: FieldConfig;
  readonly routes: readonly FieldRoute[];
  readonly tick: number;
  /** Advance the system by one step. */
  step(attractor?: FieldAttractor | null): void;
  /** Replace the keep-out rectangles; routes already drawn are left alone. */
  setObstacles(obstacles: readonly FieldRect[]): void;
}

/** A hero-sized field's defaults; callers override what the surface needs. */
export const FIELD_DEFAULTS: Omit<FieldConfig, "cols" | "rows" | "seed" | "direction"> =
  Object.freeze({
    maxRoutes: 22,
    turnChance: 0.24,
    minLength: 10,
    maxLength: 42,
    spawnChance: 0.55,
    linger: 260,
  });

/** mulberry32 — small, fast, good enough for a picture, and reproducible. */
export function createRandom(seed: number): () => number {
  let a = seed >>> 0;

  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stable 32-bit hash so a key ("workflow", "hero") seeds the same field every time. */
export function hashSeed(input: string): number {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

type Heading = 0 | 1 | 2 | 3; // east, south, west, north

/** How long a route retired by a new keep-out still lingers, in ticks. */
const EARLY_RETIRE_TICKS = 70;

const DX = [1, 0, -1, 0] as const;
const DY = [0, 1, 0, -1] as const;

interface LiveRoute extends FieldRoute {
  heading: Heading;
  targetLength: number;
}

class RouteField implements Field {
  public readonly config: FieldConfig;
  public readonly routes: LiveRoute[] = [];
  public tick = 0;

  private readonly random: () => number;
  /** `routeId + 1` per cell, 0 when free. */
  private readonly grid: Int32Array;
  private obstacles: readonly FieldRect[];
  private nextId = 0;

  public constructor(config: FieldConfig) {
    this.config = config;
    this.random = createRandom(config.seed);
    this.grid = new Int32Array(config.cols * config.rows);
    this.obstacles = config.obstacles ?? [];
  }

  /**
   * Routes already drawn inside a new keep-out are not erased — that would
   * flicker — but they are retired early, so they fade well before a finished
   * route normally would.
   */
  public setObstacles(obstacles: readonly FieldRect[]): void {
    this.obstacles = obstacles;

    const early = Math.max(0, this.tick - this.config.linger + EARLY_RETIRE_TICKS);

    for (const route of this.routes) {
      if (!route.points.some((point) => this.obstructed(point.x, point.y))) continue;
      route.doneTick = route.doneTick === null ? early : Math.min(route.doneTick, early);
    }
  }

  public step(attractor: FieldAttractor | null = null): void {
    this.tick += 1;
    this.retire();
    this.spawn(attractor);

    for (const route of this.routes) {
      if (route.doneTick !== null) continue;
      this.advance(route, attractor);
    }
  }

  private index(x: number, y: number): number {
    return y * this.config.cols + x;
  }

  private inside(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.config.cols && y < this.config.rows;
  }

  /**
   * A cell is open for a route when it is free and no OTHER route touches its
   * eight neighbours. The one-cell moat is what keeps the field legible: lines
   * never run flush against each other, and a route can still fold back on
   * itself because its own cells are not counted.
   */
  private open(x: number, y: number, routeId: number, attractor: FieldAttractor | null): boolean {
    if (!this.inside(x, y)) return false;
    if (this.grid[this.index(x, y)] !== 0) return false;
    if (this.obstructed(x, y)) return false;

    if (attractor !== null) {
      const dx = x - attractor.x;
      const dy = y - attractor.y;
      if (dx * dx + dy * dy < attractor.radius * attractor.radius) return false;
    }

    const own = routeId + 1;

    for (let ny = y - 1; ny <= y + 1; ny += 1) {
      for (let nx = x - 1; nx <= x + 1; nx += 1) {
        if (!this.inside(nx, ny)) continue;
        const occupant = this.grid[this.index(nx, ny)];
        if (occupant !== 0 && occupant !== own) return false;
      }
    }

    return true;
  }

  private obstructed(x: number, y: number): boolean {
    for (const rect of this.obstacles) {
      if (x >= rect.x && y >= rect.y && x < rect.x + rect.width && y < rect.y + rect.height) {
        return true;
      }
    }

    return false;
  }

  private claim(x: number, y: number, routeId: number): void {
    this.grid[this.index(x, y)] = routeId + 1;
  }

  private spawn(attractor: FieldAttractor | null): void {
    const alive = this.routes.filter((route) => route.doneTick === null).length;
    if (alive >= this.config.maxRoutes) return;
    if (this.random() > this.config.spawnChance) return;

    const { cols, rows, direction } = this.config;
    const forward: Heading = direction === "ltr" ? 0 : 2;
    const startColumn = direction === "ltr" ? 0 : cols - 1;

    // Most routes enter from the reading edge and travel with the text; some
    // drop in from the top or bottom, and some begin in the open, so the field
    // is a system rather than a set of stripes.
    let x: number;
    let y: number;
    let heading: Heading;
    const roll = this.random();

    if (roll < 0.5) {
      x = startColumn;
      y = Math.floor(this.random() * rows);
      heading = forward;
    } else if (roll < 0.74) {
      const fromTop = this.random() < 0.5;
      x = Math.floor(this.random() * cols);
      y = fromTop ? 0 : rows - 1;
      heading = fromTop ? 1 : 3;
    } else {
      x = Math.floor(this.random() * cols);
      y = Math.floor(this.random() * rows);
      heading = this.random() < 0.6 ? forward : this.random() < 0.5 ? 1 : 3;
    }

    const id = this.nextId;
    if (!this.open(x, y, id, attractor)) return;

    this.nextId += 1;
    this.claim(x, y, id);

    const span = this.config.maxLength - this.config.minLength;
    this.routes.push({
      id,
      points: [{ x, y }],
      bornTick: this.tick,
      doneTick: null,
      heading,
      targetLength: this.config.minLength + Math.floor(this.random() * (span + 1)),
    });
  }

  private advance(route: LiveRoute, attractor: FieldAttractor | null): void {
    const head = route.points[route.points.length - 1];
    if (head === undefined) return;

    if (route.points.length >= route.targetLength) {
      route.doneTick = this.tick;
      return;
    }

    const left = ((route.heading + 3) % 4) as Heading;
    const right = ((route.heading + 1) % 4) as Heading;
    const wantsTurn = this.random() < this.config.turnChance;

    // Order of preference: straight unless turning, then the perpendiculars —
    // the one that brings the route nearer the attractor first, otherwise a
    // coin toss so left and right stay balanced.
    let turns: readonly Heading[];
    if (attractor !== null && this.near(head, attractor)) {
      turns = this.towards(head, attractor, left, right);
    } else {
      turns = this.random() < 0.5 ? [left, right] : [right, left];
    }

    const preferred = attractor !== null && this.near(head, attractor)
      ? this.pull(head, attractor, route.heading, turns)
      : wantsTurn
        ? [...turns, route.heading]
        : [route.heading, ...turns];

    for (const heading of preferred) {
      const x = head.x + DX[heading];
      const y = head.y + DY[heading];

      if (this.open(x, y, route.id, attractor)) {
        route.heading = heading;
        route.points.push({ x, y });
        this.claim(x, y, route.id);
        return;
      }
    }

    route.doneTick = this.tick;
  }

  private near(point: FieldPoint, attractor: FieldAttractor): boolean {
    const dx = point.x - attractor.x;
    const dy = point.y - attractor.y;
    return dx * dx + dy * dy < attractor.reach * attractor.reach;
  }

  private towards(
    point: FieldPoint,
    attractor: FieldAttractor,
    left: Heading,
    right: Heading,
  ): readonly Heading[] {
    const leftDistance = this.distanceAfter(point, left, attractor);
    const rightDistance = this.distanceAfter(point, right, attractor);
    return leftDistance <= rightDistance ? [left, right] : [right, left];
  }

  /**
   * Inside the attractor's reach a route keeps whichever heading brings it
   * closest, so it curls toward the pointer and, blocked by the radius, flows
   * around it. Straight on stays first when it is still the closest option, so
   * the pull reads as a bend rather than a swerve.
   */
  private pull(
    point: FieldPoint,
    attractor: FieldAttractor,
    straight: Heading,
    turns: readonly Heading[],
  ): readonly Heading[] {
    const options: Heading[] = [straight, ...turns];
    return options.sort(
      (a, b) => this.distanceAfter(point, a, attractor) - this.distanceAfter(point, b, attractor),
    );
  }

  private distanceAfter(point: FieldPoint, heading: Heading, attractor: FieldAttractor): number {
    const dx = point.x + DX[heading] - attractor.x;
    const dy = point.y + DY[heading] - attractor.y;
    return dx * dx + dy * dy;
  }

  /** Finished routes linger, then give their cells back so the field renews. */
  private retire(): void {
    for (let index = this.routes.length - 1; index >= 0; index -= 1) {
      const route = this.routes[index];
      if (route === undefined || route.doneTick === null) continue;
      if (this.tick - route.doneTick < this.config.linger) continue;

      for (const point of route.points) {
        this.grid[this.index(point.x, point.y)] = 0;
      }
      this.routes.splice(index, 1);
    }
  }
}

export function createField(config: FieldConfig): Field {
  return new RouteField(config);
}

export interface StaticFieldOptions {
  readonly cols: number;
  readonly rows: number;
  readonly seed: number;
  readonly direction: FieldDirection;
  /** How long the system has run before the picture is taken. */
  readonly ticks?: number;
  readonly maxRoutes?: number;
}

export interface StaticRoute {
  /** An SVG path in cell units: `M x y L x y …`. */
  readonly d: string;
  readonly end: FieldPoint;
  readonly opacity: number;
}

/**
 * A still of the field after `ticks` steps, as SVG path data. Routes that have
 * stopped are quieter than the ones still travelling, which is the same reading
 * the canvas gives a moving field.
 */
export function renderStaticField(options: StaticFieldOptions): readonly StaticRoute[] {
  const config: FieldConfig = {
    ...FIELD_DEFAULTS,
    cols: options.cols,
    rows: options.rows,
    seed: options.seed,
    direction: options.direction,
    maxRoutes: options.maxRoutes ?? FIELD_DEFAULTS.maxRoutes,
    // A still keeps everything it drew.
    linger: Number.POSITIVE_INFINITY,
  };
  const field = createField(config);
  const ticks = options.ticks ?? 120;

  for (let index = 0; index < ticks; index += 1) {
    field.step(null);
  }

  return field.routes
    .filter((route) => route.points.length > 1)
    .map((route) => {
      const end = route.points[route.points.length - 1] ?? { x: 0, y: 0 };
      const age = route.doneTick === null ? 0 : field.tick - route.doneTick;
      const opacity = route.doneTick === null ? 1 : Math.max(0.28, 1 - age / (ticks * 1.15));

      return {
        d: route.points
          .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
          .join(" "),
        end,
        opacity: Math.round(opacity * 100) / 100,
      };
    });
}
