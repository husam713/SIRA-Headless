/**
 * The route running down the reading edge. A fixed hairline; a head and a
 * trail that follow the document's scroll (in CSS, on the root scroll
 * timeline). Purely decorative, so it is hidden from assistive technology.
 */
export function DigitalSpine() {
  return (
    <div className="dg-spine" aria-hidden="true">
      <span className="dg-spine__trail" />
      <span className="dg-spine__head" />
    </div>
  );
}
