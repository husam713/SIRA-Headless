"use client";

import { useId, useRef, useState, type FormEvent } from "react";

import type { DigitalContactContent, DigitalDiscoveryOption } from "@/content/digital-site/types";
import {
  composeDiscoveryBrief,
  discoveryMessage,
  discoveryService,
  type DiscoverySelection,
} from "@/lib/digital-site/discovery";

interface DiscoveryComposerProps {
  readonly contact: DigitalContactContent;
  readonly privacyHref: string;
}

type Status =
  | { readonly kind: "idle" }
  | { readonly kind: "sending" }
  | { readonly kind: "sent" }
  | { readonly kind: "error"; readonly message: string };

type Field = "name" | "email" | "message";
type FieldErrors = Partial<Record<Field, string>>;

const EMAIL = /^[^\s@,]+@[^\s@,]+\.[^\s@,]{2,}$/u;

interface ChoiceGroupProps {
  readonly name: string;
  readonly legend: string;
  readonly hint?: string;
  readonly options: readonly DigitalDiscoveryOption[];
  readonly type: "radio" | "checkbox";
  readonly isChecked: (key: string) => boolean;
  readonly onToggle: (key: string) => void;
  readonly layout?: "cards" | "chips";
}

function ChoiceGroup({ name, legend, hint, options, type, isChecked, onToggle, layout = "chips" }: ChoiceGroupProps) {
  const hintId = `${name}-hint`;
  return (
    <fieldset className="dg-question" aria-describedby={hint === undefined ? undefined : hintId}>
      <legend className="dg-question__legend">{legend}</legend>
      {hint === undefined ? null : (
        <p className="dg-field__hint" id={hintId}>
          {hint}
        </p>
      )}
      <div className={`dg-choices dg-choices--${layout}`}>
        {options.map((option) => (
          <label key={option.key} className="dg-choice">
            <input
              type={type}
              name={name}
              value={option.key}
              checked={isChecked(option.key)}
              onChange={() => onToggle(option.key)}
            />
            <span className="dg-choice__label">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * The discovery request. A few plain questions compose a brief, live, in the
 * visitor's language (pure logic in `lib/digital-site/discovery.ts`); the
 * brief travels with the contact details through the site's own pipeline
 * (`/api/contact/` → the tenant's CMS). Native radios and checkboxes carry the
 * choices, the brief is a polite live region, every error is tied to its
 * field, and a failed submit moves focus to the first field that needs it.
 */
export function DiscoveryComposer({ contact, privacyHref }: DiscoveryComposerProps) {
  const { discovery, form } = contact;
  const id = useId();
  const fields = useRef<Partial<Record<Field, HTMLInputElement | HTMLTextAreaElement | null>>>({});

  const [selection, setSelection] = useState<DiscoverySelection>({ situation: null, areas: [], size: null, timing: null });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const brief = composeDiscoveryBrief(discovery, selection);
  const body = discoveryMessage(brief, company, form.companyPrefix, message);

  const pick = (key: "situation" | "size" | "timing") => (value: string) =>
    setSelection((current) => ({ ...current, [key]: current[key] === value ? null : value }));

  const toggleArea = (value: string) =>
    setSelection((current) => ({
      ...current,
      areas: current.areas.includes(value) ? current.areas.filter((area) => area !== value) : [...current.areas, value],
    }));

  const clear = () => setSelection({ situation: null, areas: [], size: null, timing: null });

  const reset = () => {
    clear();
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setMessage("");
    setErrors({});
    setStatus({ kind: "idle" });
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (name.trim() === "") next.name = form.errorRequired;
    if (!EMAIL.test(email.trim())) next.email = form.errorEmail;
    if (body.length < 10) next.message = form.errorShort;
    return next;
  };

  const focusFirst = (found: FieldErrors) => {
    const first = (["name", "email", "message"] as const).find((field) => found[field] !== undefined);
    if (first !== undefined) fields.current[first]?.focus();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirst(found);
      return;
    }

    setStatus({ kind: "sending" });
    const honeypot =
      (event.currentTarget.elements.namedItem("company_website") as HTMLInputElement | null)?.value ?? "";

    try {
      const response = await fetch("/api/contact/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          service: discoveryService(discovery, selection, form.defaultService),
          message: body,
          company_website: honeypot,
        }),
      });

      if (response.status === 201 || response.status === 202) {
        setStatus({ kind: "sent" });
        return;
      }

      if (response.status === 422) {
        const detail = (await response.json().catch(() => ({}))) as { fields?: Record<string, string> };
        const upstream = detail.fields ?? {};
        const mapped: FieldErrors = {
          ...(upstream["name"] === undefined ? {} : { name: form.errorRequired }),
          ...(upstream["email"] === undefined ? {} : { email: form.errorEmail }),
          ...(upstream["message"] === undefined ? {} : { message: form.errorShort }),
        };
        setErrors(mapped);
        setStatus({ kind: "idle" });
        focusFirst(mapped);
        return;
      }

      setStatus({ kind: "error", message: response.status === 429 ? form.errorRateLimited : form.errorFailed });
    } catch {
      setStatus({ kind: "error", message: form.errorFailed });
    }
  };

  if (status.kind === "sent") {
    return (
      <div className="dg-sent" role="status">
        <h2 className="dg-title-m">{form.successTitle}</h2>
        <p className="dg-lede">{form.successBody}</p>
        <button type="button" className="dg-btn dg-btn--secondary" onClick={reset}>
          {form.another}
        </button>
      </div>
    );
  }

  const busy = status.kind === "sending";
  const errorCount = Object.keys(errors).length;
  const describe = (field: Field, extra?: string): string | undefined =>
    [errors[field] === undefined ? null : `${id}-${field}-error`, extra ?? null].filter(Boolean).join(" ") || undefined;

  return (
    <form className="dg-discovery" noValidate onSubmit={submit}>
      <div className="dg-discovery__questions">
        <ChoiceGroup
          name={`${id}-situation`}
          legend={discovery.situationLabel}
          options={discovery.situations}
          type="radio"
          layout="cards"
          isChecked={(key) => selection.situation === key}
          onToggle={pick("situation")}
        />
        <ChoiceGroup
          name={`${id}-areas`}
          legend={discovery.areasLabel}
          hint={discovery.areasHint}
          options={discovery.areas}
          type="checkbox"
          isChecked={(key) => selection.areas.includes(key)}
          onToggle={toggleArea}
        />
        <ChoiceGroup
          name={`${id}-size`}
          legend={discovery.sizeLabel}
          options={discovery.sizes}
          type="radio"
          isChecked={(key) => selection.size === key}
          onToggle={pick("size")}
        />
        <ChoiceGroup
          name={`${id}-timing`}
          legend={discovery.timingLabel}
          options={discovery.timings}
          type="radio"
          isChecked={(key) => selection.timing === key}
          onToggle={pick("timing")}
        />

        <fieldset className="dg-question dg-form">
          <legend className="dg-question__legend">{form.legend}</legend>

          {errorCount > 0 ? (
            <p className="dg-form__summary" role="alert">
              {form.errorSummary}
            </p>
          ) : null}

          <div className="dg-form__grid">
            <div className="dg-form__field">
              <label className="dg-field__label" htmlFor={`${id}-name`}>
                {form.name}
              </label>
              <input
                ref={(element) => {
                  fields.current.name = element;
                }}
                id={`${id}-name`}
                className="dg-input"
                name="name"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={errors.name !== undefined}
                aria-describedby={describe("name")}
              />
              {errors.name === undefined ? null : (
                <p className="dg-field__error" id={`${id}-name-error`}>
                  {errors.name}
                </p>
              )}
            </div>

            <div className="dg-form__field">
              <label className="dg-field__label" htmlFor={`${id}-email`}>
                {form.email}
              </label>
              <input
                ref={(element) => {
                  fields.current.email = element;
                }}
                id={`${id}-email`}
                className="dg-input"
                name="email"
                type="email"
                dir="ltr"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={errors.email !== undefined}
                aria-describedby={describe("email")}
              />
              {errors.email === undefined ? null : (
                <p className="dg-field__error" id={`${id}-email-error`}>
                  {errors.email}
                </p>
              )}
            </div>

            <div className="dg-form__field">
              <label className="dg-field__label" htmlFor={`${id}-phone`}>
                {form.phone} <span className="dg-field__optional">({form.optional})</span>
              </label>
              <input
                id={`${id}-phone`}
                className="dg-input"
                name="phone"
                type="tel"
                dir="ltr"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>

            <div className="dg-form__field">
              <label className="dg-field__label" htmlFor={`${id}-company`}>
                {form.company} <span className="dg-field__optional">({form.optional})</span>
              </label>
              <input
                id={`${id}-company`}
                className="dg-input"
                name="organization"
                autoComplete="organization"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
              />
            </div>

            <div className="dg-form__field dg-form__field--wide">
              <label className="dg-field__label" htmlFor={`${id}-message`}>
                {form.message} <span className="dg-field__optional">({form.optional})</span>
              </label>
              <textarea
                ref={(element) => {
                  fields.current.message = element;
                }}
                id={`${id}-message`}
                className="dg-input dg-input--area"
                name="message"
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                aria-invalid={errors.message !== undefined}
                aria-describedby={describe("message", `${id}-message-hint`)}
              />
              <p className="dg-field__hint" id={`${id}-message-hint`}>
                {form.messageHint}
              </p>
              {errors.message === undefined ? null : (
                <p className="dg-field__error" id={`${id}-message-error`}>
                  {errors.message}
                </p>
              )}
            </div>
          </div>

          {/* Honeypot: hidden from people and assistive technology, filled by bots. */}
          <div className="dg-honeypot" aria-hidden="true">
            <label>
              Website
              <input type="text" name="company_website" tabIndex={-1} autoComplete="off" defaultValue="" />
            </label>
          </div>

          {status.kind === "error" ? (
            <p className="dg-form__status" role="alert">
              {status.message}
            </p>
          ) : null}

          <div className="dg-form__actions">
            <button type="submit" className="dg-btn" disabled={busy} aria-busy={busy}>
              {busy ? form.sending : form.submit}
            </button>
            <p className="dg-form__privacy">
              {form.privacyNote}{" "}
              <a className="dg-link" href={privacyHref}>
                {form.privacyLink.label}
              </a>
            </p>
          </div>
        </fieldset>
      </div>

      <aside className="dg-brief" aria-labelledby={`${id}-brief-title`}>
        <h2 className="dg-label" id={`${id}-brief-title`}>
          {discovery.previewLabel}
        </h2>
        <p className="dg-brief__text" data-empty={brief === null ? "true" : undefined} aria-live="polite">
          {brief ?? discovery.previewEmpty}
        </p>
        <p className="dg-brief__note">{discovery.previewNote}</p>
        {brief === null ? null : (
          <button type="button" className="dg-btn dg-btn--quiet" onClick={clear}>
            {discovery.clear}
          </button>
        )}
      </aside>
    </form>
  );
}
