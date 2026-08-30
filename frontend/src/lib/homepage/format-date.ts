/**
 * Shared with GroupLatestUpdates and GroupInsights — both render the same
 * "MON YYYY" editorial date format for HomepageContentItem.date.
 */
export function formatContentDate(value: string | null): string | null {
  if (value === null) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  })
    .format(date)
    .toUpperCase();
}
