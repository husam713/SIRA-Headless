# SIRA Public and Sensitive Data Matrix

| Data family | Default exposure | Required controls |
|---|---|---|
| Companies, projects, services, news, insights, articles, events, case studies, press releases | Published records public | Editorial approval, publication status, field allowlist |
| Leadership, executives, board | Published biography fields only | Do not expose personal email or private contact data |
| Investors | Authenticated only | Dedicated capabilities, no public archive, no anonymous node access |
| Investments and portfolio | Conditional | Review valuations, ticket sizes, confidential parties and unannounced activity |
| Downloads, documents, whitepapers | Conditional | Page access is insufficient if attachment URLs remain public; define file-delivery policy |
| Media items | Approved records only | Rights, credits, alt text, direct URL policy |
| Jobs | Public vacancy content only | Applications and applicant files must never use publicly queryable CPTs |
| Testimonials | Approved public records only | Consent and withdrawal process |
| Offices and brand contacts | Public approved values only | Do not expose internal directory data |
| Brand options | Curated public subset | Exclude analytics IDs, secrets, unpublished notices and arbitrary options |
| Drafts, revisions, scheduled and pending content | Authenticated preview only | No shared cache, least-privilege authentication |
| Contact, investor, partnership, career and newsletter submissions | Private operational storage | Validation, consent, spam controls, retention, audit and restricted access |
| Clinical, applicant, investor or internal records | Never public by default | Separate private systems and capabilities |

## Current Step 1 enforcement

- `sira_investor` is GraphQL-enabled but not publicly queryable and has no
  public archive.
- Person email is absent from the public ACF GraphQL type.
- Direct document files are absent from the public ACF GraphQL type.
- Raw legacy metadata is not exposed through REST or GraphQL.
- `siraBrand` excludes analytics identifiers and raw options.
- Publication status and WordPress capabilities remain authoritative.

## Deferred policy decisions

Before production, approve:

1. Direct media/file delivery for documents, downloads and whitepapers.
2. Which investment and portfolio fields are public.
3. Whether testimonials need an explicit approval field.
4. Whether leadership email can ever be public.
5. The private system for form submissions and applicant documents.

## Step 2C.2C object-level visibility enforcement

The following approval fields default to false:

- `SiraInvestment.investmentDetails.publicDisplay`
- `SiraTestimonial.testimonialDetails.consentApproved`

The Testimonial consent timestamp is not exposed through GraphQL.

Step 2C.2C applies these rules through WPGraphQL's model-layer
`graphql_data_is_private` filter:

- Investments are private unless WordPress would otherwise expose them and
  public display is explicitly approved.
- Testimonials are private unless WordPress would otherwise expose them and
  public consent is explicitly approved.
- A user who can `edit_post` for the specific object retains authenticated
  editorial access.
- Logged-in users without that object capability cannot bypass approval.
- Existing draft, private, ownership, and capability rules remain authoritative.

Because the check is applied to each modeled post object, singular fields,
collections, search, global nodes, content nodes, and homepage/ACF
relationships share the same privacy boundary.



## Step 2C.2F banner visibility

Typed announcement and emergency banners are curated public brand data.

Public:

- active sanitized message;
- semantic severity;
- approved link;
- UTC schedule boundaries;
- dismissible flag;
- public revision hash.

Not public:

- raw ACF option arrays;
- inactive/future/expired typed banners;
- malformed schedules;
- visitor dismissal state;
- operational secrets or analytics.

Legacy banner strings remain temporarily public for backward compatibility.
