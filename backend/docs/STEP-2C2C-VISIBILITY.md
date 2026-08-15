# Step 2C.2C — Investment and Testimonial GraphQL visibility

## Objective

Apply approval and consent rules at the WPGraphQL model layer so the same
decision is enforced for every model-backed loading path.

## Rules

### Investments

A `sira_investment` is publicly visible only when:

- WordPress would otherwise expose the post; and
- `sira_investment_public_display` is exactly enabled.

A missing, empty, malformed, or false value is private.

### Testimonials

A `sira_testimonial` is publicly visible only when:

- WordPress would otherwise expose the post; and
- `sira_testimonial_consent_approved` is exactly enabled.

A missing, empty, malformed, or false value is private.

## Authenticated editorial access

An authenticated user who can pass WordPress's object-specific:

```text
edit_post:<post ID>
```

meta-capability retains access. This supports administrators, editors, and an
author who can edit their own record without granting access to a logged-in
user who lacks editorial capability.

Approval never makes an otherwise draft, private, or inaccessible record
public. The existing WPGraphQL result is preserved for approved objects.

## Central enforcement

The service hooks:

```text
graphql_data_is_private
```

and returns a private model result for unapproved objects unless the request
user can edit the specific record.

This location is intentional. Post objects may be loaded from:

- singular custom-post-type fields;
- `contentNode`;
- global Relay `node`;
- root collections;
- search connections;
- ACF relationships;
- homepage relationships;
- related-content connections;
- future model-backed resolvers.

Resolvers and response post-processing are not used as the primary privacy
boundary.

Any future custom GraphQL resolver that returns presentation records must
return normal WPGraphQL model-backed nodes. A resolver that returns raw arrays
or bypasses WPGraphQL's loaders would require a separate security review.

## Data values

Only these values mean approved:

```text
true
1
"1"
```

Values such as `"yes"`, `"on"`, arbitrary nonempty strings, missing metadata,
or malformed values remain private.

## Deferred live validation

The source implementation and plain-PHP tests can be validated without an
installed WordPress runtime. The mutating runtime test remains deferred until
the final staging installation.

Run later:

```bash
SIRA_VALIDATION_ALLOW_MUTATIONS=1 \
wp eval-file \
wp-content/plugins/sira-core/tools/validation/validate-presentation-privacy.php
```

The runtime test creates temporary Investments, Testimonials, a Page,
an Author, and a Subscriber, then removes every fixture in `finally`.
