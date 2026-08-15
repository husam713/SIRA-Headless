# Step 2C.2F — Typed banner contract

## Scope

This stage adds only the approved typed announcement and emergency banner
contract. Navigation and the combined editorial feed remain deferred.

## Public GraphQL contract

Legacy fields remain:

```graphql
announcementBanner: String
emergencyBanner: String
```

New fields:

```graphql
announcement: SiraBrandBanner
emergency: SiraBrandBanner
```

Types:

```graphql
enum SiraBrandBannerSeverity {
  INFO
  IMPORTANT
  URGENT
}

type SiraBrandLink {
  label: String!
  url: String!
  target: String
}

type SiraBrandBanner {
  message: String!
  severity: SiraBrandBannerSeverity!
  link: SiraBrandLink
  startsAt: String
  endsAt: String
  dismissible: Boolean!
  revisionKey: String!
}
```

`startsAt` and `endsAt` are UTC RFC 3339 strings.

## ACF editor contract

The private `SIRA Brand & Global Contacts` options group gains:

- Announcement Banner
- Emergency Banner

Each contains:

- message;
- severity;
- optional link;
- start time;
- end time;
- dismissible.

Raw ACF option fields remain excluded from GraphQL. `BrandManager` continues to
apply multisite precedence and exposes only the curated public shape.

## Backward compatibility

A populated typed message has priority.

When the typed message is empty, the existing legacy announcement/emergency
string becomes an always-active typed payload using the channel default:

- announcement → INFO
- emergency → URGENT

When a populated typed banner is outside its schedule, the typed field returns
null. The legacy string remains available only through its legacy GraphQL field
and cannot bypass the typed schedule.

## Scheduling

- editor times are interpreted in the WordPress site timezone;
- public times are normalized to UTC RFC 3339;
- start is inclusive;
- end is exclusive;
- malformed dates fail closed;
- an end at or before the start fails closed.

This source stage does not add a new cron or revalidation mechanism. Exact
activation timing in a cached frontend remains part of the deferred installed
cache/revalidation validation. The existing options-save revalidation behavior
is preserved.

## Links

Public banner links require:

- a nonempty label;
- a site-relative URL or HTTP(S) URL;
- optional target `_self` or `_blank`.

Unsafe schemes and incomplete links are omitted without hiding the message.

## Dismissal

`revisionKey` is a SHA-256 hash of the public channel, message, severity, link,
schedule and dismissible state. A frontend may persist a dismissal against this
key. Any public content change creates a new key.

The backend does not store visitor dismissal state.

## Privacy safeguards

Step 2C.2C remains unchanged. Investment and Testimonial visibility is still
enforced through the WPGraphQL model layer.
