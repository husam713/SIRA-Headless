"use client";

import { useId, useRef, useState } from "react";

// The only interactive part of the contact section. Everything around it stays
// a Server Component; this exists because a form needs submission state.
//
// It posts to /api/contact/, which validates again and forwards to the CMS. The
// browser never sees the WordPress origin, and client validation is a courtesy
// only — the server rejects the same cases independently.

type FieldName = "name" | "email" | "service" | "message";
type Status = "idle" | "submitting" | "sent" | "error";

interface ContactFormProps {
  readonly services: readonly string[];
}

const FIELD_MESSAGES: Readonly<Record<string, string>> = Object.freeze({
  required: "This field is required.",
  invalid: "Enter a valid email address.",
  too_short: "Please give us a little more detail.",
});

const ERROR_MESSAGES: Readonly<Record<string, string>> = Object.freeze({
  rate_limited:
    "That is a few messages in a short time. Please try again in a few minutes.",
  delivery_failed:
    "We could not deliver the message just now. Please email us directly.",
  unreachable:
    "We could not reach our mail service just now. Please email us directly.",
  not_configured: "The contact form is not available on this site yet.",
});

const inputClass =
  "border-0 border-b border-brand-on-deep/20 bg-transparent py-2 text-sm text-brand-on-deep outline-none transition-colors focus:border-brand-accent-bright";
const labelClass =
  "flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-on-deep/60";

export function ContactForm({ services }: ContactFormProps) {
  const formId = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Guards the double-click: the button is disabled while submitting, but a
    // fast Enter-key repeat can still fire before React re-renders.
    if (status === "submitting") return;

    const data = new FormData(event.currentTarget);
    setStatus("submitting");
    setFieldErrors({});
    setFormError(null);

    try {
      // Trailing slash on purpose: this application runs with
      // `trailingSlash: true`, so `/api/contact` answers 308. A POST does
      // survive that redirect, but it costs a round trip on the one interaction
      // the whole site exists to produce, and a redirected POST body is exactly
      // the thing intermediaries handle inconsistently.
      const response = await fetch("/api/contact/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          service: data.get("service"),
          message: data.get("message"),
          company_website: data.get("company_website"),
        }),
      });

      if (response.ok) {
        setStatus("sent");
        formRef.current?.reset();
        return;
      }

      const detail = (await response.json().catch(() => ({}))) as {
        status?: string;
        code?: string;
        fields?: Record<string, string>;
      };

      if (detail.status === "invalid" && detail.fields) {
        // Values are deliberately left in place so nothing typed is lost.
        setFieldErrors(detail.fields as Partial<Record<FieldName, string>>);
        setStatus("idle");
        return;
      }

      setFormError(
        ERROR_MESSAGES[detail.code ?? ""] ??
          "Something went wrong. Please try again.",
      );
      setStatus("error");
    } catch {
      setFormError(
        "We could not reach the server. Check your connection and try again.",
      );
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="bg-brand-deep-card p-8 sm:p-10">
        <p
          // Announced without stealing focus, so a screen-reader user hears the
          // outcome without being thrown out of their reading position.
          role="status"
          aria-live="polite"
          className="font-display text-2xl leading-snug text-brand-on-deep"
        >
          Thank you — your message has reached us.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-brand-on-deep/70">
          A member of the SIRA GROUP team will respond directly, usually within
          two working days.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-8 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-accent-bright underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="bg-brand-deep-card p-8 sm:p-10"
    >
      <div className="grid grid-cols-1 gap-6">
        <label className={labelClass} htmlFor={`${formId}-name`}>
          Full Name
          <input
            id={`${formId}-name`}
            name="name"
            type="text"
            required
            autoComplete="name"
            maxLength={120}
            aria-invalid={fieldErrors.name !== undefined}
            aria-describedby={fieldErrors.name ? `${formId}-name-error` : undefined}
            className={inputClass}
          />
          {fieldErrors.name ? (
            <span id={`${formId}-name-error`} className="text-[11px] normal-case text-brand-accent-bright">
              {FIELD_MESSAGES[fieldErrors.name] ?? "Please check this field."}
            </span>
          ) : null}
        </label>

        <label className={labelClass} htmlFor={`${formId}-email`}>
          Email Address
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={200}
            aria-invalid={fieldErrors.email !== undefined}
            aria-describedby={fieldErrors.email ? `${formId}-email-error` : undefined}
            className={inputClass}
          />
          {fieldErrors.email ? (
            <span id={`${formId}-email-error`} className="text-[11px] normal-case text-brand-accent-bright">
              {FIELD_MESSAGES[fieldErrors.email] ?? "Please check this field."}
            </span>
          ) : null}
        </label>

        {services.length > 0 ? (
          <label className={labelClass} htmlFor={`${formId}-service`}>
            Select Service
            <select
              id={`${formId}-service`}
              name="service"
              defaultValue={services[0]}
              className={`${inputClass} [&>option]:bg-brand-deep`}
            >
              {services.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className={labelClass} htmlFor={`${formId}-message`}>
          Your Message
          <textarea
            id={`${formId}-message`}
            name="message"
            rows={4}
            required
            maxLength={4000}
            aria-invalid={fieldErrors.message !== undefined}
            aria-describedby={fieldErrors.message ? `${formId}-message-error` : undefined}
            className={`${inputClass} resize-none`}
          />
          {fieldErrors.message ? (
            <span id={`${formId}-message-error`} className="text-[11px] normal-case text-brand-accent-bright">
              {FIELD_MESSAGES[fieldErrors.message] ?? "Please check this field."}
            </span>
          ) : null}
        </label>

        {/* Honeypot. Hidden from sight and from assistive technology, and never
            focusable, so only an automated filler reaches it. */}
        <div aria-hidden="true" className="absolute h-px w-px overflow-hidden opacity-0">
          <label htmlFor={`${formId}-company-website`}>Company website</label>
          <input
            id={`${formId}-company-website`}
            name="company_website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {formError !== null ? (
          <p role="alert" className="text-sm text-brand-accent-bright">
            {formError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="mt-2 bg-brand-accent px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-on-accent transition-opacity hover:opacity-90 disabled:cursor-progress disabled:opacity-60"
        >
          {status === "submitting" ? "Sending…" : "Send Message"}
        </button>
      </div>
    </form>
  );
}
