"use client";

import { useId, useState, type FormEvent } from "react";

import { ArrowGlyph, RouteGlyph } from "@/components/digital-site/glyphs";
import type { DigitalSiteContent } from "@/content/digital-site";
import { briefMessage, briefService, composeBrief } from "@/lib/digital-site/brief";

interface BriefComposerProps {
  readonly contact: DigitalSiteContent["contact"];
  readonly privacyHref: string;
}

type Status =
  | { readonly kind: "idle" }
  | { readonly kind: "sending" }
  | { readonly kind: "sent" }
  | { readonly kind: "error"; readonly message: string };

type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

const EMAIL = /^[^\s@,]+@[^\s@,]+\.[^\s@,]{2,}$/u;

/**
 * The brief composer. A visitor picks what repeats and what would help; the
 * page writes the sentence for them, live, and sends it through the site's
 * own contact pipeline (`/api/contact/` → the tenant's CMS). The chips are
 * toggle buttons, the sentence is a polite live region, and every error is
 * tied to its field.
 */
export function BriefComposer({ contact, privacyHref }: BriefComposerProps) {
  const { composer, form } = contact;
  const id = useId();

  const [repeats, setRepeats] = useState<readonly string[]>([]);
  const [help, setHelp] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const selection = { repeats, help };
  const brief = composeBrief(composer, selection);

  const toggleRepeat = (key: string) => {
    setRepeats((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  const clear = () => {
    setRepeats([]);
    setHelp(null);
  };

  const reset = () => {
    clear();
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setErrors({});
    setStatus({ kind: "idle" });
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (name.trim() === "") next.name = form.errorRequired;
    if (email.trim() === "") next.email = form.errorRequired;
    else if (!EMAIL.test(email.trim())) next.email = form.errorEmail;
    if (briefMessage(brief, message).length < 10) next.message = form.errorShort;
    return next;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus({ kind: "sending" });

    const honeypot = (event.currentTarget.elements.namedItem("company_website") as HTMLInputElement | null)?.value ?? "";

    try {
      const response = await fetch("/api/contact/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          service: briefService(composer, selection, form.defaultService),
          message: briefMessage(brief, message),
          company_website: honeypot,
        }),
      });

      if (response.status === 201 || response.status === 202) {
        setStatus({ kind: "sent" });
        return;
      }

      if (response.status === 422) {
        const detail = (await response.json().catch(() => ({}))) as {
          fields?: Record<string, string>;
        };
        const fields = detail.fields ?? {};
        setErrors({
          ...(fields["name"] === undefined ? {} : { name: form.errorRequired }),
          ...(fields["email"] === undefined ? {} : { email: form.errorEmail }),
          ...(fields["message"] === undefined ? {} : { message: form.errorShort }),
        });
        setStatus({ kind: "idle" });
        return;
      }

      setStatus({
        kind: "error",
        message: response.status === 429 ? form.errorRateLimited : form.errorFailed,
      });
    } catch {
      setStatus({ kind: "error", message: form.errorFailed });
    }
  };

  if (status.kind === "sent") {
    return (
      <div className="dg-done" role="status">
        <RouteGlyph name="arrival" className="dg-done__mark" />
        <h2 className="dg-display-l">{form.successTitle}</h2>
        <p className="dg-lede">{form.successBody}</p>
        <p style={{ margin: 0 }}>
          <button type="button" className="dg-link" onClick={reset}>
            <span>{form.another}</span>
            <ArrowGlyph className="dg-link__arrow" />
          </button>
        </p>
      </div>
    );
  }

  const busy = status.kind === "sending";
  const helpChosen = composer.help.find((option) => option.key === help) ?? null;

  return (
    <div className="dg-contact">
      <form className="dg-contact__main" onSubmit={submit} noValidate>
        <fieldset className="dg-fieldset">
          <legend className="dg-fieldset__legend">{composer.repeatsLabel}</legend>
          <div className="dg-chips">
            {composer.repeats.map((option) => {
              const pressed = repeats.includes(option.key);
              return (
                <button
                  key={option.key}
                  type="button"
                  className="dg-chip"
                  aria-pressed={pressed}
                  onClick={() => toggleRepeat(option.key)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="dg-fieldset" style={{ marginBlockStart: "2rem" }}>
          <legend className="dg-fieldset__legend">{composer.helpLabel}</legend>
          <div className="dg-chips" role="radiogroup" aria-label={composer.helpLabel}>
            {composer.help.map((option) => {
              const checked = help === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  role="radio"
                  className="dg-chip"
                  aria-checked={checked}
                  onClick={() => setHelp(checked ? null : option.key)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="dg-form">
          <div className="dg-form__row">
            <div className="dg-field">
              <label className="dg-field__label" htmlFor={`${id}-name`}>
                {form.name}
              </label>
              <input
                id={`${id}-name`}
                className="dg-input"
                name="name"
                autoComplete="name"
                required
                maxLength={120}
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={errors.name !== undefined}
                aria-describedby={errors.name === undefined ? undefined : `${id}-name-error`}
              />
              {errors.name === undefined ? null : (
                <p className="dg-field__error" id={`${id}-name-error`}>
                  {errors.name}
                </p>
              )}
            </div>

            <div className="dg-field">
              <label className="dg-field__label" htmlFor={`${id}-email`}>
                {form.email}
              </label>
              <input
                id={`${id}-email`}
                className="dg-input"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                maxLength={200}
                dir="ltr"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={errors.email !== undefined}
                aria-describedby={errors.email === undefined ? undefined : `${id}-email-error`}
              />
              {errors.email === undefined ? null : (
                <p className="dg-field__error" id={`${id}-email-error`}>
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div className="dg-field">
            <label className="dg-field__label" htmlFor={`${id}-phone`}>
              {form.phone}
            </label>
            <input
              id={`${id}-phone`}
              className="dg-input"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={40}
              dir="ltr"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>

          <div className="dg-field">
            <label className="dg-field__label" htmlFor={`${id}-message`}>
              {form.message}
            </label>
            <p className="dg-field__hint" id={`${id}-message-hint`}>
              {form.messageHint}
            </p>
            <textarea
              id={`${id}-message`}
              className="dg-input"
              name="message"
              maxLength={3500}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              aria-invalid={errors.message !== undefined}
              aria-describedby={
                errors.message === undefined
                  ? `${id}-message-hint`
                  : `${id}-message-hint ${id}-message-error`
              }
            />
            {errors.message === undefined ? null : (
              <p className="dg-field__error" id={`${id}-message-error`}>
                {errors.message}
              </p>
            )}
          </div>

          {/* Honeypot: never shown, never filled by a person. */}
          <div className="dg-honeypot" aria-hidden="true">
            <label htmlFor={`${id}-company-website`}>Company website</label>
            <input id={`${id}-company-website`} name="company_website" tabIndex={-1} autoComplete="off" />
          </div>

          {status.kind === "error" ? (
            <p className="dg-form__status dg-form__status--error" role="alert">
              {status.message}
            </p>
          ) : null}

          <div className="dg-form__foot">
            <button type="submit" className="dg-btn" disabled={busy} aria-busy={busy}>
              <span>{busy ? form.sending : form.submit}</span>
              <ArrowGlyph className="dg-btn__arrow" />
            </button>
            <p className="dg-form__note">
              {form.privacyNote} <a href={privacyHref}>{form.privacyLink.label}</a>
            </p>
          </div>
        </div>
      </form>

      <aside className="dg-contact__aside">
        <div className="dg-brief dg-tone-deep">
          <div className="dg-brief__label dg-mono">
            <span>{composer.previewLabel}</span>
            {brief === null ? null : (
              <button type="button" className="dg-brief__clear dg-mono" onClick={clear}>
                {composer.clear}
              </button>
            )}
          </div>
          <p className="dg-brief__text" data-empty={brief === null} aria-live="polite" aria-atomic="true">
            {brief ?? composer.previewEmpty}
            {brief === null ? null : <span className="dg-brief__caret" aria-hidden="true" />}
          </p>
          {helpChosen === null ? null : (
            <p className="dg-mono" style={{ margin: 0, color: "var(--dg-text-3)" }}>
              {helpChosen.label}
            </p>
          )}
        </div>

        <div className="dg-after">
          <h2 className="dg-mono" style={{ margin: 0, color: "var(--dg-ink-3)" }}>
            {contact.afterTitle}
          </h2>
          <ol className="dg-after__list">
            {contact.after.map((step, index) => (
              <li key={step} className="dg-after__item">
                <span className="dg-mono">{String(index + 1).padStart(2, "0")}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}
