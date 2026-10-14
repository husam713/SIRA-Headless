import type { DigitalModule, DigitalRequirement } from "@/content/digital-site/types";

/**
 * The site's explanatory drawings. Each one shows a structure the text
 * describes — tools that do not connect, modules on one database, a route of
 * documents, systems around an ERP — in the same grammar as the hero: lines
 * that turn at right angles. Server-rendered, no script.
 */

interface IslandsProps {
  readonly labels: readonly string[];
  readonly label: string;
  readonly direction: "ltr" | "rtl";
}

const ISLANDS = {
  width: 600,
  height: 320,
  box: { width: 172, height: 46 },
  places: [
    { x: 24, y: 28 },
    { x: 330, y: 12 },
    { x: 404, y: 128 },
    { x: 120, y: 142 },
    { x: 300, y: 254 },
    { x: 24, y: 258 },
  ],
  // Lines that leave a tool and stop short of the next one: the data never arrives.
  stubs: [
    "M196 51 H300",
    "M416 58 V104",
    "M292 165 H380",
    "M206 188 V230",
    "M110 258 V214",
    "M300 277 H230",
  ],
} as const;

/** "Five systems and a spreadsheet": tools drawn apart, their lines ending in the gap. */
export function ProblemIslands({ labels, label, direction }: IslandsProps) {
  const { width, height, box, places, stubs } = ISLANDS;
  const mirror = direction === "rtl";
  const x = (value: number, span = 0): number => (mirror ? width - value - span : value);

  return (
    <svg className="dg-islands" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <g transform={mirror ? `translate(${width} 0) scale(-1 1)` : undefined}>
        {stubs.map((d) => (
          <path key={d} className="dg-islands__stub" d={d} />
        ))}
      </g>
      {places.map((place, index) => (
        <g key={labels[index] ?? index} className="dg-islands__tool">
          <rect x={x(place.x, box.width)} y={place.y} width={box.width} height={box.height} rx={3} />
          <text x={x(place.x, box.width) + box.width / 2} y={place.y + box.height / 2 + 5}>
            {labels[index]}
          </text>
        </g>
      ))}
    </svg>
  );
}

interface ModuleMapProps {
  readonly modules: readonly DigitalModule[];
  readonly databaseLabel: string;
  /** Show each module's one-line description, or only its name. */
  readonly detail?: boolean;
}

/**
 * ERPNext's modules on one database: two rows of modules dropping onto a
 * shared bar. On narrow screens the bar becomes a spine along the reading
 * edge and the modules hang from it.
 */
export function ModuleMap({ modules, databaseLabel, detail = true }: ModuleMapProps) {
  const half = Math.ceil(modules.length / 2);
  const rows = [modules.slice(0, half), modules.slice(half)];

  return (
    <div className="dg-modules">
      {rows.map((row, rowIndex) => (
        <ul key={rowIndex} className={`dg-modules__row dg-modules__row--${rowIndex === 0 ? "above" : "below"}`}>
          {row.map((module) => (
            <li key={module.key} className="dg-module">
              <span className="dg-module__name">{module.name}</span>
              {detail ? <span className="dg-module__handles">{module.handles}</span> : null}
            </li>
          ))}
        </ul>
      ))}
      <p className="dg-modules__bus">
        <span>{databaseLabel}</span>
      </p>
    </div>
  );
}

/** The Saudi requirements as a row of hairline columns. */
export function Requirements({ items }: { readonly items: readonly DigitalRequirement[] }) {
  return (
    <dl className="dg-requirements">
      {items.map((item) => (
        <div key={item.key} className="dg-requirement">
          <dt className="dg-requirement__name">{item.name}</dt>
          <dd className="dg-requirement__body">{item.body}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A route of documents, in order. It is a sequence, so it is an ordered list. */
export function FlowStrip({ steps, label }: { readonly steps: readonly string[]; readonly label: string }) {
  return (
    <ol className="dg-flow" aria-label={label}>
      {steps.map((step) => (
        <li key={step} className="dg-flow__step">
          <span className="dg-flow__name">{step}</span>
        </li>
      ))}
    </ol>
  );
}

interface IntegrationHubProps {
  readonly hub: string;
  readonly groups: readonly { readonly key: string; readonly name: string; readonly items: readonly string[] }[];
}

/** The ERP at the top, the systems around it hanging from one bus. */
export function IntegrationHub({ hub, groups }: IntegrationHubProps) {
  return (
    <div className="dg-hub">
      <p className="dg-hub__core">{hub}</p>
      <ul className="dg-hub__groups">
        {groups.map((group) => (
          <li key={group.key} className="dg-hub__group">
            <p className="dg-hub__name">{group.name}</p>
            <ul className="dg-hub__items">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
