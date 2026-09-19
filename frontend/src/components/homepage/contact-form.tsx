"use client";

import { useId, useRef, useState } from "react";

import type { LocaleCode } from "@/types/site";

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
  /** The page's language; the form speaks it. Defaults to English. */
  readonly locale?: LocaleCode;
}

interface ContactFormCopy {
  readonly fieldMessages: Readonly<Record<string, string>>;
  readonly errorMessages: Readonly<Record<string, string>>;
  readonly genericError: string;
  readonly unreachable: string;
  readonly checkField: string;
  readonly sentHeading: string;
  readonly sentBody: string;
  readonly sendAnother: string;
  readonly fullName: string;
  readonly emailAddress: string;
  readonly phoneNumber: string;
  readonly optional: string;
  readonly selectService: string;
  readonly yourMessage: string;
  readonly companyWebsite: string;
  readonly sending: string;
  readonly send: string;
}

// Every string the form shows, per language. The server's error codes are the
// keys; the sentences are chosen here so the API stays language-neutral.
const COPY: Readonly<Record<LocaleCode, ContactFormCopy>> = Object.freeze({
  en: Object.freeze({
    fieldMessages: Object.freeze({
      required: "This field is required.",
      invalid: "Enter a valid email address.",
      too_short: "Please give us a little more detail.",
    }),
    errorMessages: Object.freeze({
      rate_limited:
        "That is a few messages in a short time. Please try again in a few minutes.",
      delivery_failed:
        "We could not deliver the message just now. Please email us directly.",
      unreachable:
        "We could not reach our mail service just now. Please email us directly.",
      not_configured: "The contact form is not available on this site yet.",
    }),
    genericError: "Something went wrong. Please try again.",
    unreachable: "We could not reach the server. Check your connection and try again.",
    checkField: "Please check this field.",
    sentHeading: "Thank you — your message has reached us.",
    sentBody:
      "A member of the SIRA GROUP team will respond directly, usually within two working days.",
    sendAnother: "Send another message",
    fullName: "Full Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    optional: "Optional",
    selectService: "Select Service",
    yourMessage: "Your Message",
    companyWebsite: "Company website",
    sending: "Sending…",
    send: "Send Message",
  }),
  ar: Object.freeze({
    fieldMessages: Object.freeze({
      required: "هذا الحقل مطلوب.",
      invalid: "أدخل عنوان بريد إلكتروني صحيحًا.",
      too_short: "نرجو إضافة مزيد من التفاصيل.",
    }),
    errorMessages: Object.freeze({
      rate_limited: "وصلتنا عدة رسائل خلال وقت قصير. يُرجى المحاولة بعد بضع دقائق.",
      delivery_failed: "تعذّر إيصال الرسالة الآن. يُرجى مراسلتنا عبر البريد الإلكتروني مباشرة.",
      unreachable: "تعذّر الوصول إلى خدمة البريد الآن. يُرجى مراسلتنا عبر البريد الإلكتروني مباشرة.",
      not_configured: "نموذج التواصل غير متاح على هذا الموقع بعد.",
    }),
    genericError: "حدث خطأ ما. يُرجى المحاولة مرة أخرى.",
    unreachable: "تعذّر الوصول إلى الخادم. تحقّق من اتصالك ثم حاول مرة أخرى.",
    checkField: "يُرجى مراجعة هذا الحقل.",
    sentHeading: "شكرًا لك — وصلتنا رسالتك.",
    sentBody: "سيتواصل معك أحد أعضاء فريق مجموعة سيرة مباشرة، خلال يومي عمل عادةً.",
    sendAnother: "إرسال رسالة أخرى",
    fullName: "الاسم الكامل",
    emailAddress: "البريد الإلكتروني",
    phoneNumber: "رقم الجوال",
    optional: "اختياري",
    selectService: "اختر الخدمة",
    yourMessage: "رسالتك",
    companyWebsite: "موقع الشركة",
    sending: "جارٍ الإرسال…",
    send: "إرسال الرسالة",
  }),
});

// min-h-11 is the 44px touch-target floor. The name and email fields measured
// 37px and the select 34px, which the Digital QA pass recorded as a shared-
// chrome defect it was not authorised to move. `field` paints aria-invalid
// (globals.css, "Form fields") so a sighted reader sees the rule turn as the
// message appears.
const inputClass =
  "field min-h-11 border-0 border-b border-brand-on-deep/20 bg-transparent py-2 text-sm text-brand-on-deep outline-none transition-colors focus:border-brand-accent-bright";
const labelClass =
  "flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-on-deep/60";

export function ContactForm({ services, locale = "en" }: ContactFormProps) {
  const copy = COPY[locale];
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
          phone: data.get("phone"),
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

      setFormError(copy.errorMessages[detail.code ?? ""] ?? copy.genericError);
      setStatus("error");
    } catch {
      setFormError(copy.unreachable);
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="settle-in bg-brand-deep-card p-8 sm:p-10">
        <p
          // Announced without stealing focus, so a screen-reader user hears the
          // outcome without being thrown out of their reading position.
          role="status"
          aria-live="polite"
          className="font-display text-2xl leading-snug text-brand-on-deep"
        >
          {copy.sentHeading}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-brand-on-deep/70">
          {copy.sentBody}
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="press mt-8 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-accent-bright underline underline-offset-4 hover:text-brand-on-deep"
        >
          {copy.sendAnother}
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
          {copy.fullName}
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
              {copy.fieldMessages[fieldErrors.name] ?? copy.checkField}
            </span>
          ) : null}
        </label>

        <label className={labelClass} htmlFor={`${formId}-email`}>
          {copy.emailAddress}
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
              {copy.fieldMessages[fieldErrors.email] ?? copy.checkField}
            </span>
          ) : null}
        </label>

        <label className={labelClass} htmlFor={`${formId}-phone`}>
          {copy.phoneNumber}{" "}
          <span className="normal-case tracking-normal opacity-70">({copy.optional})</span>
          <input
            id={`${formId}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            className={inputClass}
          />
        </label>

        {services.length > 0 ? (
          <label className={labelClass} htmlFor={`${formId}-service`}>
            {copy.selectService}
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
          {copy.yourMessage}
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
              {copy.fieldMessages[fieldErrors.message] ?? copy.checkField}
            </span>
          ) : null}
        </label>

        {/* Honeypot. Hidden from sight and from assistive technology, and never
            focusable, so only an automated filler reaches it. */}
        <div aria-hidden="true" className="absolute h-px w-px overflow-hidden opacity-0">
          <label htmlFor={`${formId}-company-website`}>{copy.companyWebsite}</label>
          <input
            id={`${formId}-company-website`}
            name="company_website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {formError !== null ? (
          <p role="alert" className="settle-in text-sm text-brand-accent-bright">
            {formError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="press mt-2 bg-brand-accent px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-on-accent hover:bg-brand-accent-bright disabled:cursor-progress disabled:opacity-60"
        >
          {status === "submitting" ? copy.sending : copy.send}
        </button>
      </div>
    </form>
  );
}
