"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import type { Chrome } from "@/lib/i18n/locale";

// The investor pack request: a sheet from the trailing edge, opened from any
// "Request the investor pack" control on the page. The request travels the
// existing contact pipeline — the same trusted route, validation, private
// storage and delivery every enquiry uses — with the investor type and range
// folded into the message and the subject set so it is filed as a pack
// request. Nothing new is stored anywhere.
//
// A native <dialog>: focus trapping, Escape, and inertness of the page beneath
// come from the platform rather than from a script.

type Status = "idle" | "submitting" | "sent" | "error";

interface InvestorPackDrawerProps {
  readonly chrome: Pick<
    Chrome,
    | "requestPack"
    | "packLead"
    | "packInvestorType"
    | "packInvestorTypes"
    | "packRange"
    | "packRanges"
    | "packCta"
    | "packDone"
    | "fullName"
    | "emailAddress"
    | "close"
  >;
  readonly eyebrow: string;
  /** The control that opens the sheet; rendered in place. */
  readonly trigger: ReactNode;
  readonly triggerClassName: string;
}

const inputClass =
  "field min-h-11 w-full border-0 border-b border-brand-on-deep/20 bg-transparent py-2 text-sm text-brand-on-deep outline-none transition-colors focus:border-brand-accent-bright";
const labelClass =
  "flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-on-deep/60";

export function InvestorPackDrawer({
  chrome,
  eyebrow,
  trigger,
  triggerClassName,
}: InvestorPackDrawerProps) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [investorType, setInvestorType] = useState(0);
  const [range, setRange] = useState(1);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;

    const onClose = () => {
      document.body.style.overflow = "";
    };

    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  function open() {
    const dialog = dialogRef.current;
    if (dialog === null || dialog.open) return;
    dialog.showModal();
    document.body.style.overflow = "hidden";
  }

  function close() {
    dialogRef.current?.close();
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const data = new FormData(event.currentTarget);
    setStatus("submitting");
    setError(null);

    const type = chrome.packInvestorTypes[investorType] ?? "";
    const ticket = chrome.packRanges[range] ?? "";

    try {
      const response = await fetch("/api/contact/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          service: "Investor pack request",
          message: `Investor pack request.\nInvestor type: ${type}\nIndicative range: ${ticket}`,
          company_website: data.get("company_website"),
        }),
      });

      if (response.ok) {
        setStatus("sent");
        return;
      }

      setError("We could not send the request just now. Please email us directly.");
      setStatus("error");
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <>
      <button type="button" className={triggerClassName} onClick={open}>
        {trigger}
      </button>

      <dialog
        ref={dialogRef}
        className="atlas-drawer"
        aria-labelledby={`${id}-title`}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <button
          type="button"
          className="atlas-drawer__scrim"
          aria-label={chrome.close}
          tabIndex={-1}
          onClick={close}
        />
        <div className="atlas-drawer__sheet atlas-on-deep">
          <div className="atlas-drawer__top">
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-accent-bright">
              <span aria-hidden="true" className="h-px w-8 shrink-0 bg-current" />
              {eyebrow}
            </p>
            <button type="button" className="atlas-drawer__close press" onClick={close} aria-label={chrome.close}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <h2 id={`${id}-title`}>{chrome.requestPack}</h2>

          {status === "sent" ? (
            <div className="settle-in grid gap-6">
              <p role="status" aria-live="polite" className="atlas-lead">
                {chrome.packDone}
              </p>
              <button
                type="button"
                onClick={close}
                className="press inline-flex w-fit items-center rounded-sm border border-brand-on-deep/40 px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-brand-on-deep hover:border-brand-on-deep"
              >
                {chrome.close}
              </button>
            </div>
          ) : (
            <>
              <p className="atlas-lead" style={{ fontSize: "1.05rem" }}>
                {chrome.packLead}
              </p>
              <form onSubmit={onSubmit} noValidate className="grid gap-6">
                <label className={labelClass} htmlFor={`${id}-name`}>
                  {chrome.fullName}
                  <input
                    id={`${id}-name`}
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    maxLength={120}
                    className={inputClass}
                  />
                </label>
                <label className={labelClass} htmlFor={`${id}-email`}>
                  {chrome.emailAddress}
                  <input
                    id={`${id}-email`}
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={200}
                    className={inputClass}
                  />
                </label>
                {/* Honeypot; the contact route rejects any value here. */}
                <label className="sr-only" aria-hidden="true">
                  Company website
                  <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
                </label>

                <div>
                  <p className={labelClass}>{chrome.packInvestorType}</p>
                  <div className="atlas-seg mt-3" role="group" aria-label={chrome.packInvestorType}>
                    {chrome.packInvestorTypes.map((label, index) => (
                      <button
                        key={label}
                        type="button"
                        aria-pressed={investorType === index}
                        onClick={() => setInvestorType(index)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={labelClass}>{chrome.packRange}</p>
                  <div className="atlas-seg mt-3" role="group" aria-label={chrome.packRange}>
                    {chrome.packRanges.map((label, index) => (
                      <button
                        key={label}
                        type="button"
                        aria-pressed={range === index}
                        onClick={() => setRange(index)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {error !== null ? (
                  <p role="alert" className="settle-in text-sm text-brand-accent-bright">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="press inline-flex w-fit items-center gap-2 rounded-sm bg-brand-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-brand-on-accent hover:bg-brand-accent-bright disabled:opacity-60"
                >
                  {chrome.packCta}
                  <span aria-hidden="true">&rarr;</span>
                </button>
              </form>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
