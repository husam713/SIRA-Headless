"use client";

interface GlobalErrorProps {
  readonly error: Error & {
    readonly digest?: string;
  };
  readonly reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <main role="alert">
          <h1>SIRA Enterprise encountered an error.</h1>
          <p>Reference: {error.digest ?? "unavailable"}</p>
          <button type="button" onClick={reset}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
