# Step 2C.3D Audit Independent Review Evidence

Generated locally as untracked, read-only evidence for PR #13. No tracked file, Git history, PR state, WordPress state, or deployment state was modified.

## 1. Exact PR #13 and Frontend CI #23 metadata

```json
{
    "repository":  "husam713/SIRA-Headless",
    "number":  13,
    "state":  "open",
    "isDraft":  true,
    "mergeable":  true,
    "mergeableState":  "clean",
    "base":  {
                 "branch":  "main",
                 "sha":  "4f306733b3e45bee4244688186e5ecae570fcb8b"
             },
    "head":  {
                 "branch":  "chore/2c3d-content-readiness-audit",
                 "sha":  "74a75985bbea64a564e6c4bc03358ebe8abfffec"
             },
    "commits":  [
                    {
                        "sha":  "e682b930259ce413493032f50bfbddb542c53ac3",
                        "message":  "chore(governance): start Step 2C.3D audit",
                        "authorName":  "husam713",
                        "authorDate":  "2026-08-13T01:20:09Z"
                    },
                    {
                        "sha":  "74a75985bbea64a564e6c4bc03358ebe8abfffec",
                        "message":  "docs: audit Step 2C.3D content readiness",
                        "authorName":  "husam713",
                        "authorDate":  "2026-08-13T01:47:22Z"
                    }
                ],
    "ci":  {
               "workflow":  "Frontend CI",
               "runNumber":  23,
               "status":  "completed",
               "conclusion":  "success",
               "headSha":  "74a75985bbea64a564e6c4bc03358ebe8abfffec",
               "event":  "pull_request",
               "runId":  31658891467,
               "jobs":  [
                            {
                                "name":  "frontend",
                                "status":  "completed",
                                "conclusion":  "success"
                            }
                        ]
           }
}
```

## 2. Exact requested Git diff

Command:
```text
git diff --no-color 4f306733b3e45bee4244688186e5ecae570fcb8b...74a75985bbea64a564e6c4bc03358ebe8abfffec
```

```diff
diff --git a/artifacts/step-2c3d/content-readiness.json b/artifacts/step-2c3d/content-readiness.json
new file mode 100644
index 0000000..b0cbbc3
--- /dev/null
+++ b/artifacts/step-2c3d/content-readiness.json
@@ -0,0 +1,1333 @@
+{
+  "schemaVersion": 1,
+  "audit": "Step 2C.3D WordPress Content Readiness",
+  "auditedAt": "2026-08-13T01:46:34.942Z",
+  "mode": "read-only public GraphQL metadata",
+  "querySource": "content-readiness-audit.mjs",
+  "security": {
+    "endpointValuesPersisted": false,
+    "credentialsPersisted": false,
+    "unpublishedBodiesPersisted": false,
+    "rawPayloadsPersisted": false,
+    "wordpressMutationOccurred": false,
+    "backendMutationOccurred": false,
+    "productionDeploymentOccurred": false
+  },
+  "limitations": [
+    "Public GraphQL proves published/anonymous contract readiness only.",
+    "Draft/private totals, WordPress admin provenance, and show_on_front mutation controls require authorized admin/WP-CLI evidence.",
+    "Counts are exact only when truncated=false."
+  ],
+  "readinessMatrix": {
+    "group": {
+      "frontPage": "MISSING_CONTENT",
+      "primaryMenu": "MISSING_CONFIGURATION",
+      "footerMenu": "MISSING_CONFIGURATION",
+      "legalMenu": "MISSING_CONFIGURATION",
+      "businessUnit": "READY",
+      "editorial": "READY",
+      "projects": "EDITORIAL_ACTION",
+      "brand": "DATA_CORRECTION_REQUIRED",
+      "announcement": "READY",
+      "emergency": "READY",
+      "media": "EDITORIAL_ACTION"
+    },
+    "consulting": {
+      "frontPage": "MISSING_CONFIGURATION",
+      "primaryMenu": "MISSING_CONFIGURATION",
+      "footerMenu": "MISSING_CONFIGURATION",
+      "legalMenu": "MISSING_CONFIGURATION",
+      "businessUnit": "MISSING_CONFIGURATION",
+      "editorial": "OWNER_DECISION",
+      "projects": "OWNER_DECISION",
+      "brand": "READY",
+      "announcement": "READY",
+      "emergency": "READY",
+      "media": "READY"
+    },
+    "healthcare": {
+      "frontPage": "MISSING_CONFIGURATION",
+      "primaryMenu": "MISSING_CONFIGURATION",
+      "footerMenu": "MISSING_CONFIGURATION",
+      "legalMenu": "MISSING_CONFIGURATION",
+      "businessUnit": "MISSING_CONFIGURATION",
+      "editorial": "OWNER_DECISION",
+      "projects": "OWNER_DECISION",
+      "brand": "DATA_CORRECTION_REQUIRED",
+      "announcement": "READY",
+      "emergency": "READY",
+      "media": "EDITORIAL_ACTION"
+    },
+    "lifestyle": {
+      "frontPage": "MISSING_CONFIGURATION",
+      "primaryMenu": "MISSING_CONFIGURATION",
+      "footerMenu": "MISSING_CONFIGURATION",
+      "legalMenu": "MISSING_CONFIGURATION",
+      "businessUnit": "MISSING_CONFIGURATION",
+      "editorial": "OWNER_DECISION",
+      "projects": "OWNER_DECISION",
+      "brand": "READY",
+      "announcement": "READY",
+      "emergency": "READY",
+      "media": "READY"
+    },
+    "realestate": {
+      "frontPage": "MISSING_CONFIGURATION",
+      "primaryMenu": "MISSING_CONFIGURATION",
+      "footerMenu": "MISSING_CONFIGURATION",
+      "legalMenu": "MISSING_CONFIGURATION",
+      "businessUnit": "MISSING_CONFIGURATION",
+      "editorial": "OWNER_DECISION",
+      "projects": "OWNER_DECISION",
+      "brand": "READY",
+      "announcement": "READY",
+      "emergency": "READY",
+      "media": "READY"
+    }
+  },
+  "classificationCounts": {
+    "READY": 18,
+    "MISSING_CONTENT": 1,
+    "MISSING_CONFIGURATION": 23,
+    "DATA_CORRECTION_REQUIRED": 2,
+    "EDITORIAL_ACTION": 3,
+    "OWNER_DECISION": 8,
+    "BLOCKED": 0
+  },
+  "findings": [
+    {
+      "site": "Group",
+      "area": "frontPage",
+      "classification": "MISSING_CONTENT",
+      "evidence": "Page 457 resolves at / with variant=group; all accepted Group hero fields are empty.",
+      "expectedCanonicalState": "The configured Group front page contains approved structured Group homepage content.",
+      "owner": "EDITORIAL_ACTION",
+      "recommendedAction": "Supply and approve the Group structured homepage content without changing the canonical / lookup.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query the accepted SiraHomepage operation and verify populated Group fields."
+    },
+    {
+      "site": "Group",
+      "area": "primaryMenu",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "Native PRIMARY menu assignment count=0.",
+      "expectedCanonicalState": "Exactly one usable native PRIMARY menu assignment.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create/approve and assign the PRIMARY menu using native WordPress menu locations.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
+    },
+    {
+      "site": "Group",
+      "area": "footerMenu",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "Native FOOTER menu assignment count=0.",
+      "expectedCanonicalState": "Exactly one usable native FOOTER menu assignment.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create/approve and assign the FOOTER menu using native WordPress menu locations.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
+    },
+    {
+      "site": "Group",
+      "area": "legalMenu",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "Native LEGAL menu assignment count=0.",
+      "expectedCanonicalState": "Exactly one usable native LEGAL menu assignment.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create/approve and assign the LEGAL menu using native WordPress menu locations.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
+    },
+    {
+      "site": "Group",
+      "area": "projects",
+      "classification": "EDITORIAL_ACTION",
+      "evidence": "3 published projects; 3 missing featured images; 3 missing subtitles.",
+      "expectedCanonicalState": "Every launch-ready project card has approved archive presentation fields.",
+      "owner": "EDITORIAL_ACTION",
+      "recommendedAction": "Supply approved featured images/alt text and project subtitles for the three published projects.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query siraProjects and verify zero required archive-field gaps."
+    },
+    {
+      "site": "Group",
+      "area": "brand",
+      "classification": "DATA_CORRECTION_REQUIRED",
+      "evidence": "Live name=SIRA Global Logo; colors={\"primary\":\"#cccccc\",\"secondary\":\"#5b5b5b\",\"accent\":\"#cca34b\",\"paper\":\"#f7f4ed\",\"ink\":\"#20242b\"}.",
+      "expectedCanonicalState": "SIRA GROUP; primary #cca34b; secondary #172232; accent #cca34b; paper #f7f4ed; ink #20242b.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Correct the canonical public brand fields in WordPress using the approved repository identity evidence; do not normalize these values in Next.js.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query siraBrand and compare exact effective values."
+    },
+    {
+      "site": "Group",
+      "area": "media",
+      "classification": "EDITORIAL_ACTION",
+      "evidence": "Brand logo alt missing=true; brand mark populated=false; project featured images missing=3.",
+      "expectedCanonicalState": "Public required media has useful alt text, safe URLs, and usable dimensions; launch project cards have approved images where required.",
+      "owner": "EDITORIAL_ACTION",
+      "recommendedAction": "Supply meaningful accessibility text and required project imagery without fabricating assets.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query public media metadata and verify alt/dimensions/source readiness."
+    },
+    {
+      "site": "Consulting",
+      "area": "frontPage",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "showOnFront=posts; pageOnFront=0; page(id: \"/\", idType: URI)=null",
+      "expectedCanonicalState": "A published Branch homepage assigned as the static front page and resolving at URI /.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create/select the approved branch homepage and assign it in Reading Settings after editorial approval.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query readingSettings and page(id: \"/\", idType: URI)."
+    },
+    {
+      "site": "Consulting",
+      "area": "primaryMenu",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "Native PRIMARY menu assignment count=0.",
+      "expectedCanonicalState": "Exactly one usable native PRIMARY menu assignment.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create/approve and assign the PRIMARY menu using native WordPress menu locations.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
+    },
+    {
+      "site": "Consulting",
+      "area": "footerMenu",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "Native FOOTER menu assignment count=0.",
+      "expectedCanonicalState": "Exactly one usable native FOOTER menu assignment.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create/approve and assign the FOOTER menu using native WordPress menu locations.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
+    },
+    {
+      "site": "Consulting",
+      "area": "legalMenu",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "Native LEGAL menu assignment count=0.",
+      "expectedCanonicalState": "Exactly one usable native LEGAL menu assignment.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create/approve and assign the LEGAL menu using native WordPress menu locations.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
+    },
+    {
+      "site": "Consulting",
+      "area": "businessUnit",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "Expected slug=consulting; term lookup=null; available term count=0.",
+      "expectedCanonicalState": "A canonical Business Unit term with slug consulting.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create the exact approved term and assign only relevant editorial content; do not derive or rename slugs mechanically.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query siraBusinessUnit by SLUG and its filtered contentNodes connection."
+    },
+    {
+      "site": "Consulting",
+      "area": "editorial",
+      "classification": "OWNER_DECISION",
+      "evidence": "Published accepted-family root count=0; filtered connection unavailable because the exact Business Unit term is missing.",
+      "expectedCanonicalState": "An owner-confirmed intentional empty state or an approved editorial publishing plan.",
+      "owner": "OWNER_DECISION",
+      "recommendedAction": "Decide whether this branch intentionally launches with an empty editorial feed; if not, assign editorial creation to an editor after the Business Unit term exists.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "After the exact term exists, re-query root and branch-filtered accepted editorial connections."
+    },
+    {
+      "site": "Consulting",
+      "area": "projects",
+      "classification": "OWNER_DECISION",
+      "evidence": "Published project count=0.",
+      "expectedCanonicalState": "An owner-confirmed intentional empty archive or an approved project publishing plan.",
+      "owner": "OWNER_DECISION",
+      "recommendedAction": "Decide whether this branch requires launch projects; if yes, commission public project records rather than adding frontend fallbacks.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query siraProjects and native project-single URIs."
+    },
+    {
+      "site": "Healthcare",
+      "area": "frontPage",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "showOnFront=posts; pageOnFront=0; page(id: \"/\", idType: URI)=null",
+      "expectedCanonicalState": "A published Branch homepage assigned as the static front page and resolving at URI /.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create/select the approved branch homepage and assign it in Reading Settings after editorial approval.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query readingSettings and page(id: \"/\", idType: URI)."
+    },
+    {
+      "site": "Healthcare",
+      "area": "primaryMenu",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "Native PRIMARY menu assignment count=0.",
+      "expectedCanonicalState": "Exactly one usable native PRIMARY menu assignment.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create/approve and assign the PRIMARY menu using native WordPress menu locations.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
+    },
+    {
+      "site": "Healthcare",
+      "area": "footerMenu",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "Native FOOTER menu assignment count=0.",
+      "expectedCanonicalState": "Exactly one usable native FOOTER menu assignment.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create/approve and assign the FOOTER menu using native WordPress menu locations.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
+    },
+    {
+      "site": "Healthcare",
+      "area": "legalMenu",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "Native LEGAL menu assignment count=0.",
+      "expectedCanonicalState": "Exactly one usable native LEGAL menu assignment.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create/approve and assign the LEGAL menu using native WordPress menu locations.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
+    },
+    {
+      "site": "Healthcare",
+      "area": "businessUnit",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "Expected slug=healthcare; term lookup=null; available term count=0.",
+      "expectedCanonicalState": "A canonical Business Unit term with slug healthcare.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create the exact approved term and assign only relevant editorial content; do not derive or rename slugs mechanically.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query siraBusinessUnit by SLUG and its filtered contentNodes connection."
+    },
+    {
+      "site": "Healthcare",
+      "area": "editorial",
+      "classification": "OWNER_DECISION",
+      "evidence": "Published accepted-family root count=0; filtered connection unavailable because the exact Business Unit term is missing.",
+      "expectedCanonicalState": "An owner-confirmed intentional empty state or an approved editorial publishing plan.",
+      "owner": "OWNER_DECISION",
+      "recommendedAction": "Decide whether this branch intentionally launches with an empty editorial feed; if not, assign editorial creation to an editor after the Business Unit term exists.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "After the exact term exists, re-query root and branch-filtered accepted editorial connections."
+    },
+    {
+      "site": "Healthcare",
+      "area": "projects",
+      "classification": "OWNER_DECISION",
+      "evidence": "Published project count=0.",
+      "expectedCanonicalState": "An owner-confirmed intentional empty archive or an approved project publishing plan.",
+      "owner": "OWNER_DECISION",
+      "recommendedAction": "Decide whether this branch requires launch projects; if yes, commission public project records rather than adding frontend fallbacks.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query siraProjects and native project-single URIs."
+    },
+    {
+      "site": "Healthcare",
+      "area": "brand",
+      "classification": "DATA_CORRECTION_REQUIRED",
+      "evidence": "Live name=SIRA Health; colors={\"primary\":\"#1e73be\",\"secondary\":\"#81d742\",\"accent\":\"#8224e3\",\"paper\":\"#f3f7fb\",\"ink\":\"#1f2932\"}.",
+      "expectedCanonicalState": "SIRA Healthcare; primary #2c6dad; secondary #12283f; accent #2c6dad; paper #f3f7fb; ink #1f2932.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Correct the canonical public brand fields in WordPress using the approved repository identity evidence; do not normalize these values in Next.js.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query siraBrand and compare exact effective values."
+    },
+    {
+      "site": "Healthcare",
+      "area": "media",
+      "classification": "EDITORIAL_ACTION",
+      "evidence": "Brand mark alt missing=true.",
+      "expectedCanonicalState": "Public required media has useful alt text, safe URLs, and usable dimensions; launch project cards have approved images where required.",
+      "owner": "EDITORIAL_ACTION",
+      "recommendedAction": "Supply meaningful accessibility text and required project imagery without fabricating assets.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query public media metadata and verify alt/dimensions/source readiness."
+    },
+    {
+      "site": "Lifestyle",
+      "area": "frontPage",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "showOnFront=posts; pageOnFront=0; page(id: \"/\", idType: URI)=null",
+      "expectedCanonicalState": "A published Branch homepage assigned as the static front page and resolving at URI /.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create/select the approved branch homepage and assign it in Reading Settings after editorial approval.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query readingSettings and page(id: \"/\", idType: URI)."
+    },
+    {
+      "site": "Lifestyle",
+      "area": "primaryMenu",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "Native PRIMARY menu assignment count=0.",
+      "expectedCanonicalState": "Exactly one usable native PRIMARY menu assignment.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create/approve and assign the PRIMARY menu using native WordPress menu locations.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
+    },
+    {
+      "site": "Lifestyle",
+      "area": "footerMenu",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "Native FOOTER menu assignment count=0.",
+      "expectedCanonicalState": "Exactly one usable native FOOTER menu assignment.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create/approve and assign the FOOTER menu using native WordPress menu locations.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
+    },
+    {
+      "site": "Lifestyle",
+      "area": "legalMenu",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "Native LEGAL menu assignment count=0.",
+      "expectedCanonicalState": "Exactly one usable native LEGAL menu assignment.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create/approve and assign the LEGAL menu using native WordPress menu locations.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
+    },
+    {
+      "site": "Lifestyle",
+      "area": "businessUnit",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "Expected slug=lifestyle; term lookup=null; available term count=0.",
+      "expectedCanonicalState": "A canonical Business Unit term with slug lifestyle.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create the exact approved term and assign only relevant editorial content; do not derive or rename slugs mechanically.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query siraBusinessUnit by SLUG and its filtered contentNodes connection."
+    },
+    {
+      "site": "Lifestyle",
+      "area": "editorial",
+      "classification": "OWNER_DECISION",
+      "evidence": "Published accepted-family root count=0; filtered connection unavailable because the exact Business Unit term is missing.",
+      "expectedCanonicalState": "An owner-confirmed intentional empty state or an approved editorial publishing plan.",
+      "owner": "OWNER_DECISION",
+      "recommendedAction": "Decide whether this branch intentionally launches with an empty editorial feed; if not, assign editorial creation to an editor after the Business Unit term exists.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "After the exact term exists, re-query root and branch-filtered accepted editorial connections."
+    },
+    {
+      "site": "Lifestyle",
+      "area": "projects",
+      "classification": "OWNER_DECISION",
+      "evidence": "Published project count=0.",
+      "expectedCanonicalState": "An owner-confirmed intentional empty archive or an approved project publishing plan.",
+      "owner": "OWNER_DECISION",
+      "recommendedAction": "Decide whether this branch requires launch projects; if yes, commission public project records rather than adding frontend fallbacks.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query siraProjects and native project-single URIs."
+    },
+    {
+      "site": "Real Estate",
+      "area": "frontPage",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "showOnFront=posts; pageOnFront=0; page(id: \"/\", idType: URI)=null",
+      "expectedCanonicalState": "A published Branch homepage assigned as the static front page and resolving at URI /.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create/select the approved branch homepage and assign it in Reading Settings after editorial approval.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query readingSettings and page(id: \"/\", idType: URI)."
+    },
+    {
+      "site": "Real Estate",
+      "area": "primaryMenu",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "Native PRIMARY menu assignment count=0.",
+      "expectedCanonicalState": "Exactly one usable native PRIMARY menu assignment.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create/approve and assign the PRIMARY menu using native WordPress menu locations.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
+    },
+    {
+      "site": "Real Estate",
+      "area": "footerMenu",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "Native FOOTER menu assignment count=0.",
+      "expectedCanonicalState": "Exactly one usable native FOOTER menu assignment.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create/approve and assign the FOOTER menu using native WordPress menu locations.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
+    },
+    {
+      "site": "Real Estate",
+      "area": "legalMenu",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "Native LEGAL menu assignment count=0.",
+      "expectedCanonicalState": "Exactly one usable native LEGAL menu assignment.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create/approve and assign the LEGAL menu using native WordPress menu locations.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
+    },
+    {
+      "site": "Real Estate",
+      "area": "businessUnit",
+      "classification": "MISSING_CONFIGURATION",
+      "evidence": "Expected slug=real-estate; term lookup=null; available term count=0.",
+      "expectedCanonicalState": "A canonical Business Unit term with slug real-estate.",
+      "owner": "CMS_ADMIN_ACTION",
+      "recommendedAction": "Create the exact approved term and assign only relevant editorial content; do not derive or rename slugs mechanically.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query siraBusinessUnit by SLUG and its filtered contentNodes connection."
+    },
+    {
+      "site": "Real Estate",
+      "area": "editorial",
+      "classification": "OWNER_DECISION",
+      "evidence": "Published accepted-family root count=0; filtered connection unavailable because the exact Business Unit term is missing.",
+      "expectedCanonicalState": "An owner-confirmed intentional empty state or an approved editorial publishing plan.",
+      "owner": "OWNER_DECISION",
+      "recommendedAction": "Decide whether this branch intentionally launches with an empty editorial feed; if not, assign editorial creation to an editor after the Business Unit term exists.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "After the exact term exists, re-query root and branch-filtered accepted editorial connections."
+    },
+    {
+      "site": "Real Estate",
+      "area": "projects",
+      "classification": "OWNER_DECISION",
+      "evidence": "Published project count=0.",
+      "expectedCanonicalState": "An owner-confirmed intentional empty archive or an approved project publishing plan.",
+      "owner": "OWNER_DECISION",
+      "recommendedAction": "Decide whether this branch requires launch projects; if yes, commission public project records rather than adding frontend fallbacks.",
+      "destructive": false,
+      "mutationAuthorized": false,
+      "verificationMethod": "Re-query siraProjects and native project-single URIs."
+    }
+  ],
+  "historicalRevalidation": {
+    "branchFrontPages": "UNCHANGED_MISSING",
+    "nativeMenus": "UNCHANGED_MISSING",
+    "groupBrand": "UNCORRECTED",
+    "healthcareBrand": "UNCORRECTED"
+  },
+  "sites": {
+    "group": {
+      "siteName": "Group",
+      "inspected": true,
+      "homepage": {
+        "showOnFront": "page",
+        "pageOnFront": 457,
+        "resolvesRootUri": true,
+        "databaseId": 457,
+        "uri": "/",
+        "title": "Home",
+        "status": "publish",
+        "isFrontPage": true,
+        "variant": "group",
+        "expectedVariant": "group",
+        "heroFieldPopulation": {
+          "headingBefore": false,
+          "headingHighlight": false,
+          "headingAfter": false,
+          "description": false
+        }
+      },
+      "menus": {
+        "primary": {
+          "assignedCount": 0,
+          "truncated": false,
+          "menus": []
+        },
+        "footer": {
+          "assignedCount": 0,
+          "truncated": false,
+          "menus": []
+        },
+        "legal": {
+          "assignedCount": 0,
+          "truncated": false,
+          "menus": []
+        }
+      },
+      "businessUnit": {
+        "expectedSlug": null,
+        "term": null,
+        "availableTerms": [
+          {
+            "databaseId": 60,
+            "name": "Consulting",
+            "slug": "consulting",
+            "totalAssignedObjectCount": 1,
+            "acceptedEditorialAssignments": {
+              "returnedCount": 1,
+              "truncated": false,
+              "byType": {
+                "SiraNewsItem": 1,
+                "SiraInsight": 0,
+                "SiraArticle": 0,
+                "SiraPressRelease": 0
+              },
+              "missingTitleCount": 0,
+              "unsafeUriCount": 0,
+              "missingDateCount": 0,
+              "missingExcerptCount": 0,
+              "restrictedCount": 0,
+              "featuredMedia": {
+                "populatedCount": 0,
+                "missingAltCount": 0,
+                "unsafeUrlCount": 0,
+                "invalidDimensionsCount": 0
+              }
+            }
+          },
+          {
+            "databaseId": 62,
+            "name": "Healthcare",
+            "slug": "healthcare",
+            "totalAssignedObjectCount": 1,
+            "acceptedEditorialAssignments": {
+              "returnedCount": 1,
+              "truncated": false,
+              "byType": {
+                "SiraNewsItem": 1,
+                "SiraInsight": 0,
+                "SiraArticle": 0,
+                "SiraPressRelease": 0
+              },
+              "missingTitleCount": 0,
+              "unsafeUriCount": 0,
+              "missingDateCount": 0,
+              "missingExcerptCount": 0,
+              "restrictedCount": 0,
+              "featuredMedia": {
+                "populatedCount": 0,
+                "missingAltCount": 0,
+                "unsafeUrlCount": 0,
+                "invalidDimensionsCount": 0
+              }
+            }
+          },
+          {
+            "databaseId": 61,
+            "name": "Lifestyle",
+            "slug": "lifestyle",
+            "totalAssignedObjectCount": 1,
+            "acceptedEditorialAssignments": {
+              "returnedCount": 1,
+              "truncated": false,
+              "byType": {
+                "SiraNewsItem": 1,
+                "SiraInsight": 0,
+                "SiraArticle": 0,
+                "SiraPressRelease": 0
+              },
+              "missingTitleCount": 0,
+              "unsafeUriCount": 0,
+              "missingDateCount": 0,
+              "missingExcerptCount": 0,
+              "restrictedCount": 0,
+              "featuredMedia": {
+                "populatedCount": 0,
+                "missingAltCount": 0,
+                "unsafeUrlCount": 0,
+                "invalidDimensionsCount": 0
+              }
+            }
+          },
+          {
+            "databaseId": 59,
+            "name": "Real Estate",
+            "slug": "real-estate",
+            "totalAssignedObjectCount": 1,
+            "acceptedEditorialAssignments": {
+              "returnedCount": 1,
+              "truncated": false,
+              "byType": {
+                "SiraNewsItem": 1,
+                "SiraInsight": 0,
+                "SiraArticle": 0,
+                "SiraPressRelease": 0
+              },
+              "missingTitleCount": 0,
+              "unsafeUriCount": 0,
+              "missingDateCount": 0,
+              "missingExcerptCount": 0,
+              "restrictedCount": 0,
+              "featuredMedia": {
+                "populatedCount": 0,
+                "missingAltCount": 0,
+                "unsafeUrlCount": 0,
+                "invalidDimensionsCount": 0
+              }
+            }
+          }
+        ],
+        "availableTermsTruncated": false
+      },
+      "editorial": {
+        "groupRootUnfiltered": true,
+        "root": {
+          "returnedCount": 4,
+          "truncated": false,
+          "byType": {
+            "SiraNewsItem": 4,
+            "SiraInsight": 0,
+            "SiraArticle": 0,
+            "SiraPressRelease": 0
+          },
+          "missingTitleCount": 0,
+          "unsafeUriCount": 0,
+          "missingDateCount": 0,
+          "missingExcerptCount": 0,
+          "restrictedCount": 0,
+          "featuredMedia": {
+            "populatedCount": 0,
+            "missingAltCount": 0,
+            "unsafeUrlCount": 0,
+            "invalidDimensionsCount": 0
+          }
+        },
+        "branchFiltered": null
+      },
+      "projects": {
+        "returnedPublishedCount": 3,
+        "truncated": false,
+        "restrictedCount": 0,
+        "missingTitleCount": 0,
+        "unsafeUriCount": 0,
+        "missingExcerptCount": 0,
+        "missingFeaturedImageCount": 3,
+        "missingFeaturedAltCount": 0,
+        "missingSubtitleCount": 3,
+        "missingLocationCount": 0,
+        "missingStatusCount": 0,
+        "missingRenderedContentCount": 0,
+        "gallery": {
+          "populatedProjectCount": 0,
+          "truncatedProjectCount": 0,
+          "unsafeMediaCount": 0,
+          "missingAltCount": 0,
+          "restrictedMediaCount": 0
+        },
+        "statistics": {
+          "populatedProjectCount": 0,
+          "malformedEntryCount": 0
+        },
+        "relatedCompanies": {
+          "populatedProjectCount": 3,
+          "truncatedProjectCount": 0,
+          "restrictedCount": 0,
+          "malformedCount": 0
+        }
+      },
+      "brand": {
+        "key": "group",
+        "name": "SIRA Global Logo",
+        "tagline": "Shaping a smarter future.",
+        "colors": {
+          "primary": "#cccccc",
+          "secondary": "#5b5b5b",
+          "accent": "#cca34b",
+          "paper": "#f7f4ed",
+          "ink": "#20242b"
+        },
+        "logo": {
+          "populated": true,
+          "databaseId": 459,
+          "safeSourceUrl": true,
+          "hasAltText": false,
+          "width": 1626,
+          "height": 613,
+          "restricted": false
+        },
+        "mark": {
+          "populated": false
+        },
+        "publicIdentityPresence": {
+          "email": false,
+          "phone": false,
+          "address": false,
+          "description": false,
+          "mission": false,
+          "vision": false
+        },
+        "announcement": {
+          "state": "null"
+        },
+        "emergency": {
+          "state": "null"
+        }
+      }
+    },
+    "consulting": {
+      "siteName": "Consulting",
+      "inspected": true,
+      "homepage": {
+        "showOnFront": "posts",
+        "pageOnFront": 0,
+        "resolvesRootUri": false,
+        "databaseId": null,
+        "uri": null,
+        "title": null,
+        "status": null,
+        "isFrontPage": false,
+        "variant": null,
+        "expectedVariant": "branch",
+        "heroFieldPopulation": null
+      },
+      "menus": {
+        "primary": {
+          "assignedCount": 0,
+          "truncated": false,
+          "menus": []
+        },
+        "footer": {
+          "assignedCount": 0,
+          "truncated": false,
+          "menus": []
+        },
+        "legal": {
+          "assignedCount": 0,
+          "truncated": false,
+          "menus": []
+        }
+      },
+      "businessUnit": {
+        "expectedSlug": "consulting",
+        "term": null,
+        "availableTerms": [],
+        "availableTermsTruncated": false
+      },
+      "editorial": {
+        "groupRootUnfiltered": false,
+        "root": {
+          "returnedCount": 0,
+          "truncated": false,
+          "byType": {
+            "SiraNewsItem": 0,
+            "SiraInsight": 0,
+            "SiraArticle": 0,
+            "SiraPressRelease": 0
+          },
+          "missingTitleCount": 0,
+          "unsafeUriCount": 0,
+          "missingDateCount": 0,
+          "missingExcerptCount": 0,
+          "restrictedCount": 0,
+          "featuredMedia": {
+            "populatedCount": 0,
+            "missingAltCount": 0,
+            "unsafeUrlCount": 0,
+            "invalidDimensionsCount": 0
+          }
+        },
+        "branchFiltered": null
+      },
+      "projects": {
+        "returnedPublishedCount": 0,
+        "truncated": false,
+        "restrictedCount": 0,
+        "missingTitleCount": 0,
+        "unsafeUriCount": 0,
+        "missingExcerptCount": 0,
+        "missingFeaturedImageCount": 0,
+        "missingFeaturedAltCount": 0,
+        "missingSubtitleCount": 0,
+        "missingLocationCount": 0,
+        "missingStatusCount": 0,
+        "missingRenderedContentCount": 0,
+        "gallery": {
+          "populatedProjectCount": 0,
+          "truncatedProjectCount": 0,
+          "unsafeMediaCount": 0,
+          "missingAltCount": 0,
+          "restrictedMediaCount": 0
+        },
+        "statistics": {
+          "populatedProjectCount": 0,
+          "malformedEntryCount": 0
+        },
+        "relatedCompanies": {
+          "populatedProjectCount": 0,
+          "truncatedProjectCount": 0,
+          "restrictedCount": 0,
+          "malformedCount": 0
+        }
+      },
+      "brand": {
+        "key": "consulting",
+        "name": "SIRA Consulting",
+        "tagline": "Strategy for new markets.",
+        "colors": {
+          "primary": "#8b5aae",
+          "secondary": "#2b1f36",
+          "accent": "#8b5aae",
+          "paper": "#f8f4fa",
+          "ink": "#29232d"
+        },
+        "logo": {
+          "populated": false
+        },
+        "mark": {
+          "populated": false
+        },
+        "publicIdentityPresence": {
+          "email": false,
+          "phone": false,
+          "address": false,
+          "description": false,
+          "mission": false,
+          "vision": false
+        },
+        "announcement": {
+          "state": "null"
+        },
+        "emergency": {
+          "state": "null"
+        }
+      }
+    },
+    "healthcare": {
+      "siteName": "Healthcare",
+      "inspected": true,
+      "homepage": {
+        "showOnFront": "posts",
+        "pageOnFront": 0,
+        "resolvesRootUri": false,
+        "databaseId": null,
+        "uri": null,
+        "title": null,
+        "status": null,
+        "isFrontPage": false,
+        "variant": null,
+        "expectedVariant": "branch",
+        "heroFieldPopulation": null
+      },
+      "menus": {
+        "primary": {
+          "assignedCount": 0,
+          "truncated": false,
+          "menus": []
+        },
+        "footer": {
+          "assignedCount": 0,
+          "truncated": false,
+          "menus": []
+        },
+        "legal": {
+          "assignedCount": 0,
+          "truncated": false,
+          "menus": []
+        }
+      },
+      "businessUnit": {
+        "expectedSlug": "healthcare",
+        "term": null,
+        "availableTerms": [],
+        "availableTermsTruncated": false
+      },
+      "editorial": {
+        "groupRootUnfiltered": false,
+        "root": {
+          "returnedCount": 0,
+          "truncated": false,
+          "byType": {
+            "SiraNewsItem": 0,
+            "SiraInsight": 0,
+            "SiraArticle": 0,
+            "SiraPressRelease": 0
+          },
+          "missingTitleCount": 0,
+          "unsafeUriCount": 0,
+          "missingDateCount": 0,
+          "missingExcerptCount": 0,
+          "restrictedCount": 0,
+          "featuredMedia": {
+            "populatedCount": 0,
+            "missingAltCount": 0,
+            "unsafeUrlCount": 0,
+            "invalidDimensionsCount": 0
+          }
+        },
+        "branchFiltered": null
+      },
+      "projects": {
+        "returnedPublishedCount": 0,
+        "truncated": false,
+        "restrictedCount": 0,
+        "missingTitleCount": 0,
+        "unsafeUriCount": 0,
+        "missingExcerptCount": 0,
+        "missingFeaturedImageCount": 0,
+        "missingFeaturedAltCount": 0,
+        "missingSubtitleCount": 0,
+        "missingLocationCount": 0,
+        "missingStatusCount": 0,
+        "missingRenderedContentCount": 0,
+        "gallery": {
+          "populatedProjectCount": 0,
+          "truncatedProjectCount": 0,
+          "unsafeMediaCount": 0,
+          "missingAltCount": 0,
+          "restrictedMediaCount": 0
+        },
+        "statistics": {
+          "populatedProjectCount": 0,
+          "malformedEntryCount": 0
+        },
+        "relatedCompanies": {
+          "populatedProjectCount": 0,
+          "truncatedProjectCount": 0,
+          "restrictedCount": 0,
+          "malformedCount": 0
+        }
+      },
+      "brand": {
+        "key": "healthcare",
+        "name": "SIRA Health",
+        "tagline": "Advancing diagnostic and healthcare infrastructure.",
+        "colors": {
+          "primary": "#1e73be",
+          "secondary": "#81d742",
+          "accent": "#8224e3",
+          "paper": "#f3f7fb",
+          "ink": "#1f2932"
+        },
+        "logo": {
+          "populated": true,
+          "databaseId": 15,
+          "safeSourceUrl": true,
+          "hasAltText": true,
+          "width": 768,
+          "height": 290,
+          "restricted": false
+        },
+        "mark": {
+          "populated": true,
+          "databaseId": 16,
+          "safeSourceUrl": true,
+          "hasAltText": false,
+          "width": 285,
+          "height": 274,
+          "restricted": false
+        },
+        "publicIdentityPresence": {
+          "email": true,
+          "phone": true,
+          "address": true,
+          "description": true,
+          "mission": true,
+          "vision": true
+        },
+        "announcement": {
+          "state": "populated",
+          "messagePresent": true,
+          "severity": "INFO",
+          "linkPresent": true,
+          "linkSafe": true,
+          "target": null,
+          "startsAt": null,
+          "endsAt": null,
+          "dismissible": false,
+          "revisionKeyPresent": true,
+          "schedule": "active"
+        },
+        "emergency": {
+          "state": "null"
+        }
+      }
+    },
+    "lifestyle": {
+      "siteName": "Lifestyle",
+      "inspected": true,
+      "homepage": {
+        "showOnFront": "posts",
+        "pageOnFront": 0,
+        "resolvesRootUri": false,
+        "databaseId": null,
+        "uri": null,
+        "title": null,
+        "status": null,
+        "isFrontPage": false,
+        "variant": null,
+        "expectedVariant": "branch",
+        "heroFieldPopulation": null
+      },
+      "menus": {
+        "primary": {
+          "assignedCount": 0,
+          "truncated": false,
+          "menus": []
+        },
+        "footer": {
+          "assignedCount": 0,
+          "truncated": false,
+          "menus": []
+        },
+        "legal": {
+          "assignedCount": 0,
+          "truncated": false,
+          "menus": []
+        }
+      },
+      "businessUnit": {
+        "expectedSlug": "lifestyle",
+        "term": null,
+        "availableTerms": [],
+        "availableTermsTruncated": false
+      },
+      "editorial": {
+        "groupRootUnfiltered": false,
+        "root": {
+          "returnedCount": 0,
+          "truncated": false,
+          "byType": {
+            "SiraNewsItem": 0,
+            "SiraInsight": 0,
+            "SiraArticle": 0,
+            "SiraPressRelease": 0
+          },
+          "missingTitleCount": 0,
+          "unsafeUriCount": 0,
+          "missingDateCount": 0,
+          "missingExcerptCount": 0,
+          "restrictedCount": 0,
+          "featuredMedia": {
+            "populatedCount": 0,
+            "missingAltCount": 0,
+            "unsafeUrlCount": 0,
+            "invalidDimensionsCount": 0
+          }
+        },
+        "branchFiltered": null
+      },
+      "projects": {
+        "returnedPublishedCount": 0,
+        "truncated": false,
+        "restrictedCount": 0,
+        "missingTitleCount": 0,
+        "unsafeUriCount": 0,
+        "missingExcerptCount": 0,
+        "missingFeaturedImageCount": 0,
+        "missingFeaturedAltCount": 0,
+        "missingSubtitleCount": 0,
+        "missingLocationCount": 0,
+        "missingStatusCount": 0,
+        "missingRenderedContentCount": 0,
+        "gallery": {
+          "populatedProjectCount": 0,
+          "truncatedProjectCount": 0,
+          "unsafeMediaCount": 0,
+          "missingAltCount": 0,
+          "restrictedMediaCount": 0
+        },
+        "statistics": {
+          "populatedProjectCount": 0,
+          "malformedEntryCount": 0
+        },
+        "relatedCompanies": {
+          "populatedProjectCount": 0,
+          "truncatedProjectCount": 0,
+          "restrictedCount": 0,
+          "malformedCount": 0
+        }
+      },
+      "brand": {
+        "key": "lifestyle",
+        "name": "SIRA Lifestyle",
+        "tagline": "Creating destination-led hospitality and lifestyle experiences.",
+        "colors": {
+          "primary": "#2e8c72",
+          "secondary": "#12382f",
+          "accent": "#2e8c72",
+          "paper": "#f2f8f5",
+          "ink": "#1f2b27"
+        },
+        "logo": {
+          "populated": false
+        },
+        "mark": {
+          "populated": false
+        },
+        "publicIdentityPresence": {
+          "email": false,
+          "phone": false,
+          "address": false,
+          "description": false,
+          "mission": false,
+          "vision": false
+        },
+        "announcement": {
+          "state": "null"
+        },
+        "emergency": {
+          "state": "null"
+        }
+      }
+    },
+    "realestate": {
+      "siteName": "Real Estate",
+      "inspected": true,
+      "homepage": {
+        "showOnFront": "posts",
+        "pageOnFront": 0,
+        "resolvesRootUri": false,
+        "databaseId": null,
+        "uri": null,
+        "title": null,
+        "status": null,
+        "isFrontPage": false,
+        "variant": null,
+        "expectedVariant": "branch",
+        "heroFieldPopulation": null
+      },
+      "menus": {
+        "primary": {
+          "assignedCount": 0,
+          "truncated": false,
+          "menus": []
+        },
+        "footer": {
+          "assignedCount": 0,
+          "truncated": false,
+          "menus": []
+        },
+        "legal": {
+          "assignedCount": 0,
+          "truncated": false,
+          "menus": []
+        }
+      },
+      "businessUnit": {
+        "expectedSlug": "real-estate",
+        "term": null,
+        "availableTerms": [],
+        "availableTermsTruncated": false
+      },
+      "editorial": {
+        "groupRootUnfiltered": false,
+        "root": {
+          "returnedCount": 0,
+          "truncated": false,
+          "byType": {
+            "SiraNewsItem": 0,
+            "SiraInsight": 0,
+            "SiraArticle": 0,
+            "SiraPressRelease": 0
+          },
+          "missingTitleCount": 0,
+          "unsafeUriCount": 0,
+          "missingDateCount": 0,
+          "missingExcerptCount": 0,
+          "restrictedCount": 0,
+          "featuredMedia": {
+            "populatedCount": 0,
+            "missingAltCount": 0,
+            "unsafeUrlCount": 0,
+            "invalidDimensionsCount": 0
+          }
+        },
+        "branchFiltered": null
+      },
+      "projects": {
+        "returnedPublishedCount": 0,
+        "truncated": false,
+        "restrictedCount": 0,
+        "missingTitleCount": 0,
+        "unsafeUriCount": 0,
+        "missingExcerptCount": 0,
+        "missingFeaturedImageCount": 0,
+        "missingFeaturedAltCount": 0,
+        "missingSubtitleCount": 0,
+        "missingLocationCount": 0,
+        "missingStatusCount": 0,
+        "missingRenderedContentCount": 0,
+        "gallery": {
+          "populatedProjectCount": 0,
+          "truncatedProjectCount": 0,
+          "unsafeMediaCount": 0,
+          "missingAltCount": 0,
+          "restrictedMediaCount": 0
+        },
+        "statistics": {
+          "populatedProjectCount": 0,
+          "malformedEntryCount": 0
+        },
+        "relatedCompanies": {
+          "populatedProjectCount": 0,
+          "truncatedProjectCount": 0,
+          "restrictedCount": 0,
+          "malformedCount": 0
+        }
+      },
+      "brand": {
+        "key": "realestate",
+        "name": "SIRA Real Estate",
+        "tagline": "Building enduring places across markets.",
+        "colors": {
+          "primary": "#b0733c",
+          "secondary": "#2b1b14",
+          "accent": "#b0733c",
+          "paper": "#faf5ef",
+          "ink": "#25201d"
+        },
+        "logo": {
+          "populated": false
+        },
+        "mark": {
+          "populated": false
+        },
+        "publicIdentityPresence": {
+          "email": false,
+          "phone": false,
+          "address": false,
+          "description": false,
+          "mission": false,
+          "vision": false
+        },
+        "announcement": {
+          "state": "null"
+        },
+        "emergency": {
+          "state": "null"
+        }
+      }
+    }
+  }
+}
diff --git a/docs/PROJECT-STATE.md b/docs/PROJECT-STATE.md
index 79a5b27..3853184 100644
--- a/docs/PROJECT-STATE.md
+++ b/docs/PROJECT-STATE.md
@@ -1,15 +1,15 @@
 # SIRA Current Project State
 
-Last reconciled from repository and GitHub evidence: 2026-08-12
+Last reconciled from repository and GitHub evidence: 2026-08-13
 
 ## Current execution state
 
-- **Current business stage:** Step 2C.3C — Typed Frontend Query Contracts
-- **Current substage:** 2C.3C-CLOSURE — Cumulative Closure Gate
+- **Current business stage:** Step 2C.3D — WordPress Content Readiness
+- **Current substage:** 2C.3D-AUDIT — Read-Only CMS Readiness Audit
 - **Canonical integration/default branch:** `main`
-- **Business-code baseline:** `73f41e88a5d1016e2cdd586991765d992a513416`
-- **Current governed integration head:** `73f41e88a5d1016e2cdd586991765d992a513416`
-- **Latest approved business milestone:** Step 2C.3C-B7
+- **Business-code baseline:** `4f306733b3e45bee4244688186e5ecae570fcb8b`
+- **Current governed integration head:** `4f306733b3e45bee4244688186e5ecae570fcb8b`
+- **Latest approved business milestone:** Step 2C.3C
 - **Latest approved tag:** `step-2c3b-approved`
 - **Production deployment:** NOT AUTHORIZED
 
@@ -31,6 +31,8 @@ Step 2C.3C-B6 is owner accepted and merged through PR `#10` at `a116fea3514af457
 
 Step 2C.3C-B7 is owner accepted and merged through PR `#11` at `73f41e88a5d1016e2cdd586991765d992a513416`. Its implementation head is `851b85b3d685ae1304466dc5baecadc87bcd1b90`, Frontend CI run #17 passed on that exact head, and the accepted full regression was 21 files / 174 tests PASS. No production deployment or WordPress/backend change occurred.
 
+Step 2C.3C cumulative closure is owner accepted and merged through PR `#12` at `4f306733b3e45bee4244688186e5ecae570fcb8b` using a normal merge commit. Its accepted closure head is `847b0c3f067d9af4f00591c3554a7a693a646017`, Frontend CI run #21 passed on that exact head, and the accepted full regression was 22 files / 183 tests PASS. No production deployment or WordPress/backend change occurred.
+
 ## GitHub governance status
 
 - **GOV-001 — CLOSED:** repository default branch is `main`.
@@ -119,9 +121,9 @@ Before Step 2C.3C can be accepted, the typed frontend contract layer must cover:
 
 Production visual components remain out of scope for this stage.
 
-## Current Step 2C.3C closure policy
+## Current Step 2C.3D audit policy
 
-The cumulative closure gate branches from governed `main` at the accepted B7 merge and validates the complete B1–B7 typed frontend contract without adding product behavior. Step 2C.3C remains in progress until the closure PR passes local validation, Frontend CI, independent review, and explicit owner acceptance. CMS readiness, preview/SEO, production design/UI, backend reconciliation, and deployment remain later governed work.
+Step 2C.3C is accepted and merged. The first Step 2C.3D increment audits all five WordPress tenants read-only against the accepted B1–B7 contracts, classifies missing or incorrect CMS state, and produces a deterministic correction plan. It does not authorize CMS mutation, backend work, production UI, or deployment. `SOT-001` remains open.
 
 Required delivery flow:
 
diff --git a/docs/SOURCE-OF-TRUTH.md b/docs/SOURCE-OF-TRUTH.md
index 70115c0..01883c0 100644
--- a/docs/SOURCE-OF-TRUTH.md
+++ b/docs/SOURCE-OF-TRUTH.md
@@ -21,16 +21,16 @@ A later verified artifact may temporarily supersede repository source for a spec
 
 - Repository: `husam713/SIRA-Headless`
 - Canonical integration/default branch: `main`
-- Current governed frontend baseline/head: `73f41e88a5d1016e2cdd586991765d992a513416`
-- Latest accepted increment: Step 2C.3C-B7
-- B7 PR / implementation / merge: `#11` / `851b85b3d685ae1304466dc5baecadc87bcd1b90` / `73f41e88a5d1016e2cdd586991765d992a513416`
+- Current governed frontend baseline/head: `4f306733b3e45bee4244688186e5ecae570fcb8b`
+- Latest accepted increment: Step 2C.3C cumulative closure
+- Closure PR / implementation / merge: `#12` / `847b0c3f067d9af4f00591c3554a7a693a646017` / `4f306733b3e45bee4244688186e5ecae570fcb8b`
 - Approved tag: `step-2c3b-approved`
 - Checked-in canonical live schema: `frontend/schema/wpgraphql.graphql`
 - Group audit schema: `frontend/schema/wpgraphql.group.graphql`
 - Metadata: `frontend/schema/wpgraphql.meta.json`
 - Compatibility evidence: `frontend/schema/wpgraphql.compatibility.json`
 
-The canonical live metadata records Consulting as canonical, four exact branch peers, and Group as a structural superset. B7 Frontend CI run #17 passed on implementation head `851b85b3d685ae1304466dc5baecadc87bcd1b90`, and the full 21-file / 174-test regression passed before owner acceptance and merge. The cumulative Step 2C.3C closure gate is validation-only and does not supersede the open backend conflict or authorize production.
+The canonical live metadata records Consulting as canonical, four exact branch peers, and Group as a structural superset. Step 2C.3C closure Frontend CI run #21 passed on head `847b0c3f067d9af4f00591c3554a7a693a646017`, and the full 22-file / 183-test regression passed before owner acceptance and merge. Step 2C.3D is now a read-only CMS readiness audit; it does not supersede the open backend conflict or authorize production or CMS mutation.
 
 ## Current backend source status
 
diff --git a/docs/STEP-2C3D-CONTENT-READINESS.md b/docs/STEP-2C3D-CONTENT-READINESS.md
new file mode 100644
index 0000000..e60a9e8
--- /dev/null
+++ b/docs/STEP-2C3D-CONTENT-READINESS.md
@@ -0,0 +1,130 @@
+# Step 2C.3D WordPress Content Readiness Audit
+
+## Executive summary
+
+All five SIRA tenants were inspected independently on 2026-08-13 through their already-configured, read-only public WPGraphQL endpoints. The audit used only coordinates supported by the accepted B1–B7 operations and checked-in canonical schema. It stored no raw payload, endpoint, credential, private body, or unpublished sensitive record.
+
+The audit produced 55 site/area classifications:
+
+| Classification | Count |
+| --- | ---: |
+| READY | 18 |
+| MISSING_CONTENT | 1 |
+| MISSING_CONFIGURATION | 23 |
+| DATA_CORRECTION_REQUIRED | 2 |
+| EDITORIAL_ACTION | 3 |
+| OWNER_DECISION | 8 |
+| BLOCKED | 0 |
+
+The historical readiness findings remain materially current: Group is the only configured static front page, no tenant exposes an assigned PRIMARY/FOOTER/LEGAL menu, and the Group/Healthcare brand identity discrepancies remain uncorrected. Group has meaningful published editorial/project records, but its homepage structure and project-card media are incomplete. Branch editorial/project collections are valid-empty; owner decisions are required before treating those empty states as missing launch content.
+
+## Evidence and limits
+
+- Accepted baseline: `main@4f306733b3e45bee4244688186e5ecae570fcb8b`.
+- Safe machine evidence: `artifacts/step-2c3d/content-readiness.json`.
+- Audit mechanism: `frontend/scripts/content-readiness-audit.mjs`.
+- Mode: anonymous/public, read-only GraphQL metadata; no introspection.
+- Result-bearing content connections report `truncated=false`; native menu assignment queries returned zero and the relevant Business Unit term collection is also untruncated.
+- Public GraphQL proves published frontend readiness. Draft/private totals, private restriction counts, and WordPress-admin provenance remain unavailable without separate authorized admin/WP-CLI evidence. This does not prevent a deterministic correction plan for the public contracts.
+
+## Five-site readiness matrix
+
+| Site | Front page | Primary menu | Footer menu | Legal menu | Business Unit | Editorial | Projects | Brand | Announcement | Emergency | Media |
+| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
+| Group | MISSING_CONTENT | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | READY | READY | EDITORIAL_ACTION | DATA_CORRECTION_REQUIRED | READY | READY | EDITORIAL_ACTION |
+| Consulting | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | OWNER_DECISION | OWNER_DECISION | READY | READY | READY | READY |
+| Healthcare | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | OWNER_DECISION | OWNER_DECISION | DATA_CORRECTION_REQUIRED | READY | READY | EDITORIAL_ACTION |
+| Lifestyle | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | OWNER_DECISION | OWNER_DECISION | READY | READY | READY | READY |
+| Real Estate | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | OWNER_DECISION | OWNER_DECISION | READY | READY | READY | READY |
+
+## Detailed findings
+
+The machine-readable artifact contains one complete correction-manifest record per non-READY site/area cell. The following consolidates identical actions without losing tenant scope.
+
+### Static front pages
+
+- **Group — MISSING_CONTENT:** `showOnFront=page`, `pageOnFront=457`; published Page 457 resolves at `/`, is the front page, and has variant `group`. All four accepted Group hero fields are empty. Expected: approved structured Group homepage content. Owner: `EDITORIAL_ACTION`. Destructive: no. Mutation authorized: no. Verify by rerunning the accepted Homepage query.
+- **Consulting, Healthcare, Lifestyle, Real Estate — MISSING_CONFIGURATION:** each reports `showOnFront=posts`, `pageOnFront=0`, and `page(id: "/", idType: URI)=null`. Expected: an approved published Branch homepage assigned as static front page. Owner: `CMS_ADMIN_ACTION` after editorial approval. Destructive: no. Mutation authorized: no. Verify through `readingSettings` and the accepted Homepage query.
+
+### Native menus
+
+- **All five sites — MISSING_CONFIGURATION:** PRIMARY, FOOTER, and LEGAL each return zero native assigned menus. Expected: exactly one approved usable native menu per logical location. Owner: `CMS_ADMIN_ACTION`, with editorial/owner approval of link structure and labels. Destructive: no. Mutation authorized: no. Verify using the accepted Navigation operation, including hierarchy and URL checks.
+
+### Business Unit taxonomy
+
+- **Group — READY:** the unfiltered root contract remains correct. Group exposes exact terms `consulting` (ID 60), `healthcare` (62), `lifestyle` (61), and `real-estate` (59). Each term has exactly one accepted editorial assignment, each a `SiraNewsItem`; the four assignments collectively account for the four items in the unfiltered accepted feed. No `realestate` slug drift exists.
+- **Consulting, Healthcare, Lifestyle, Real Estate — MISSING_CONFIGURATION:** the exact mapped term lookup is null and the local term collection is empty on each branch. Expected exact slugs: `consulting`, `healthcare`, `lifestyle`, `real-estate`. Owner: `CMS_ADMIN_ACTION`. Destructive: no. Mutation authorized: no. Create exact terms and assign only relevant accepted editorial records; verify by querying the native term and its server-filtered `contentNodes` connection.
+
+### Editorial content
+
+- **Group — READY:** four published accepted-family items, all `SiraNewsItem`; titles, URIs, dates, and excerpts are usable; no restricted/unsafe item surfaced. The feed is correctly unfiltered. Featured media is absent on all four, but the accepted editorial contract treats it as optional.
+- **All four branches — OWNER_DECISION:** each native root accepted-family feed is empty and untruncated. The exact server-filtered connection is not yet available because its required Business Unit term is missing; this is separately classified as `MISSING_CONFIGURATION`. The root empty state is technically valid, so the owner must decide whether each branch intentionally launches empty. If not, owner: `EDITORIAL_ACTION` after canonical Business Unit term creation. Verify through the accepted root and server-filtered feed operations.
+
+### Projects
+
+- **Group — EDITORIAL_ACTION:** three published projects; titles, URIs, excerpts, locations, statuses, rendered content, and related companies are usable. All three lack featured images and subtitles. Gallery/statistics are empty; whether those optional detail sections are needed is a later editorial/design choice. Owner: `EDITORIAL_ACTION`. Destructive: no. Mutation authorized: no. Verify through accepted Archive and Single operations.
+- **All four branches — OWNER_DECISION:** zero public projects, untruncated. The empty archive is contract-valid. The owner must decide whether launch projects are required; if yes, commission editorial creation rather than frontend fallbacks. Mutation authorized: no.
+
+### Brand identity
+
+- **Group — DATA_CORRECTION_REQUIRED:** live `name="SIRA Global Logo"`, primary `#cccccc`, secondary `#5b5b5b`; approved repository identity is `SIRA GROUP`, primary/accent `#cca34b`, secondary `#172232`, paper `#f7f4ed`, ink `#20242b`. Owner: `CMS_ADMIN_ACTION`. Destructive: no. Mutation authorized: no. Verify exact `siraBrand` effective values.
+- **Healthcare — DATA_CORRECTION_REQUIRED:** live `name="SIRA Health"`, primary `#1e73be`, secondary `#81d742`, accent `#8224e3`; approved repository identity is `SIRA Healthcare`, primary/accent `#2c6dad`, secondary `#12283f`, paper `#f3f7fb`, ink `#1f2932`. Owner: `CMS_ADMIN_ACTION`. Destructive: no. Mutation authorized: no. Verify exact `siraBrand` effective values.
+- **Consulting, Lifestyle, Real Estate — READY:** key, name, tagline, and all five identity colors match the approved repository identity evidence. Missing remote logo/mark values are safely covered by accepted static presentation assets and are not classified as a CMS correctness failure.
+
+### Announcement and emergency
+
+- **All sites — READY:** null typed banners are valid by contract. Group, Consulting, Lifestyle, and Real Estate have null announcement/emergency values.
+- **Healthcare — READY:** announcement is populated, structurally valid, `INFO`, has a safe link and revision key, and has no start/end bound (currently active). Emergency is null. No stale or malformed scheduled banner was found.
+
+### Media
+
+- **Group — EDITORIAL_ACTION:** the brand logo has safe dimensions/URL but lacks alt text; the brand mark is absent; all three published project cards lack featured images. Owner: `EDITORIAL_ACTION`. Destructive: no. Mutation authorized: no.
+- **Healthcare — EDITORIAL_ACTION:** the brand mark has safe dimensions/URL but lacks alt text. Owner: `EDITORIAL_ACTION`. Destructive: no. Mutation authorized: no.
+- **Consulting, Lifestyle, Real Estate — READY:** no live content currently requires media through the accepted published data contracts; no unsafe/restricted media surfaced.
+
+## Action ownership
+
+### CMS_ADMIN_ACTION
+
+1. Correct Group and Healthcare canonical brand fields using approved repository evidence.
+2. Create/select and assign approved static front pages for Consulting, Healthcare, Lifestyle, and Real Estate.
+3. Create and assign PRIMARY, FOOTER, and LEGAL native menus on all five sites after link approval.
+4. Create exact branch Business Unit terms and assign relevant accepted editorial records.
+
+### EDITORIAL_ACTION
+
+1. Supply and approve Group structured homepage content.
+2. Supply Group project featured images, useful alt text, and subtitles.
+3. Supply missing Group logo/mark accessibility/media data and Healthcare mark alt text.
+4. Create branch editorial/project content only where owner launch decisions require it.
+
+### OWNER_DECISION
+
+1. Decide whether each branch intentionally launches with an empty editorial feed.
+2. Decide whether each branch requires projects at launch.
+3. Approve branch homepage content and native menu information architecture before CMS administration.
+
+### FUTURE_FRONTEND_STAGE
+
+- Gallery/statistics presentation requirements, rich HTML rendering/sanitization, image optimization, production design/components, preview, SEO, canonical-domain/redirect decisions, and deployment remain later governed stages.
+
+### BLOCKED
+
+- None for public CMS readiness planning.
+- Admin-only draft/private totals and provenance were not inspected; they require separately authorized WordPress admin/WP-CLI evidence if the owner later requires them.
+
+## Security and mutation record
+
+- WordPress mutations: none.
+- Backend changes: none.
+- Runtime GraphQL/generated/adapters/domain/UI changes: none.
+- Live introspection/schema fetch: none.
+- Credentials/endpoints/private bodies persisted: none.
+- Production deployment: none.
+- `SOT-001`: OPEN.
+
+## Audit conclusion
+
+All five required tenants and all required public contract areas were inspected. Missing/incorrect CMS state is classified with deterministic non-destructive follow-up actions, and no unresolved evidence gap prevents planning. Step 2C.3D remains in progress pending owner review and separately authorized CMS corrections.
+
+STEP_2C3D_AUDIT_READY_FOR_OWNER_REVIEW
diff --git a/docs/tasks/step-2c3d-content-readiness.md b/docs/tasks/step-2c3d-content-readiness.md
new file mode 100644
index 0000000..8553cb0
--- /dev/null
+++ b/docs/tasks/step-2c3d-content-readiness.md
@@ -0,0 +1,111 @@
+# Step 2C.3D — WordPress Content Readiness Audit
+
+## Status
+
+APPROVED FOR READ-ONLY AUDIT on `chore/2c3d-content-readiness-audit`.
+
+Step 2C.3D remains **IN PROGRESS**. This increment may inspect and report CMS state but may not change it.
+
+## Objective
+
+Audit Group, Consulting, Healthcare, Lifestyle, and Real Estate independently against the accepted Step 2C.3C B1–B7 public frontend contracts. Classify current CMS readiness and produce a deterministic correction manifest without adding frontend behavior or mutating WordPress.
+
+## Accepted baseline
+
+- Canonical/default branch: `main`.
+- Step 2C.3C closure PR: `#12`.
+- Accepted closure head: `847b0c3f067d9af4f00591c3554a7a693a646017`.
+- Accepted merge commit: `4f306733b3e45bee4244688186e5ecae570fcb8b`.
+- Merge method: normal merge commit.
+- Frontend CI run #21: PASS on the exact closure head.
+- Production deployment: none.
+- WordPress/backend change in Step 2C.3C: none.
+- `SOT-001`: OPEN and blocking speculative backend changes.
+
+## Audit scope
+
+For each tenant inspect:
+
+1. Reading Settings/static front page and the canonical `/` Homepage lookup;
+2. native PRIMARY, FOOTER, and LEGAL menus;
+3. exact ADR-014 Business Unit term and assignments;
+4. published News, Insight, Article, and Press Release metadata;
+5. public Project Archive and Project Single readiness metadata;
+6. effective public `siraBrand` identity;
+7. typed announcement and emergency state/scheduling;
+8. required public media metadata;
+9. cross-site differences required by the accepted contract or approved identity evidence.
+
+## Classification vocabulary
+
+Every site/area cell must be exactly one of:
+
+- `READY`
+- `MISSING_CONTENT`
+- `MISSING_CONFIGURATION`
+- `DATA_CORRECTION_REQUIRED`
+- `EDITORIAL_ACTION`
+- `OWNER_DECISION`
+- `BLOCKED`
+
+Every non-READY finding must identify a safe evidence summary, expected state, action owner, non/destructive status, mutation authorization, and verification method.
+
+## Read-only evidence mechanism
+
+`frontend/scripts/content-readiness-audit.mjs` executes one checked-in-schema-backed public GraphQL metadata query per trusted configured tenant endpoint. It:
+
+- reads endpoints from the already-authorized untracked `frontend/.env.local`;
+- never prints or persists endpoint values or credentials;
+- requests only published/public metadata needed by B1–B7;
+- does not request unpublished bodies, users, submissions, cookies, or private options;
+- transforms responses immediately into counts, IDs, presence/safety flags, and anomaly summaries;
+- stores no raw GraphQL payload;
+- fails closed per tenant and records a safe blocker code.
+
+The safe tracked output is `artifacts/step-2c3d/content-readiness.json`.
+
+## Evidence limits
+
+Anonymous public GraphQL proves the behavior seen by the accepted published frontend contracts. It does not prove draft/private totals, private restriction counts, admin provenance, or a mutation-ready WordPress correction path. Those limitations must remain explicit and must not be converted into assumptions.
+
+## Mutation boundary
+
+This increment must not:
+
+- modify WordPress content, options, terms, menus, media, or users;
+- modify backend runtime code;
+- modify any runtime `.graphql` document, generated contract, adapter, domain type, UI, dependency, lockfile, or production configuration;
+- run live schema introspection or schema fetch;
+- deploy or merge without later explicit owner approval.
+
+## Validation
+
+From `frontend/`:
+
+1. `pnpm lint`
+2. `pnpm typecheck`
+3. focused durable-state/readiness contract test
+4. `pnpm test:run`
+5. `pnpm build`
+
+From repository root:
+
+6. `git diff --check`
+7. inspect complete diff and changed-file scope
+8. scan the safe artifact/diff for secrets, credentials, endpoints, private bodies, and unrelated changes
+
+## Acceptance
+
+Return `STEP_2C3D_AUDIT_READY_FOR_OWNER_REVIEW` only when all five tenants were inspected, all non-ready states are classified and actionable, and no unresolved evidence gap prevents correction planning.
+
+Return `STEP_2C3D_AUDIT_BLOCKED` if tenant access or source-of-truth conflict prevents a meaningful plan.
+
+Missing CMS content is an audit result, not an audit failure.
+
+## Delivery
+
+- commit only governance/audit/test artifacts;
+- push `chore/2c3d-content-readiness-audit`;
+- open a draft PR to `main`;
+- wait for Frontend CI;
+- do not merge, mutate WordPress, or deploy.
diff --git a/frontend/scripts/content-readiness-audit.mjs b/frontend/scripts/content-readiness-audit.mjs
new file mode 100644
index 0000000..922be07
--- /dev/null
+++ b/frontend/scripts/content-readiness-audit.mjs
@@ -0,0 +1,770 @@
+import { readFile, writeFile } from "node:fs/promises";
+import { basename, resolve } from "node:path";
+import process from "node:process";
+
+const SITE_CONFIG = Object.freeze({
+  group: Object.freeze({
+    name: "Group",
+    endpointKey: "SIRA_WP_GROUP_GRAPHQL_URL",
+    businessUnit: null,
+  }),
+  consulting: Object.freeze({
+    name: "Consulting",
+    endpointKey: "SIRA_WP_CONSULTING_GRAPHQL_URL",
+    businessUnit: "consulting",
+  }),
+  healthcare: Object.freeze({
+    name: "Healthcare",
+    endpointKey: "SIRA_WP_HEALTHCARE_GRAPHQL_URL",
+    businessUnit: "healthcare",
+  }),
+  lifestyle: Object.freeze({
+    name: "Lifestyle",
+    endpointKey: "SIRA_WP_LIFESTYLE_GRAPHQL_URL",
+    businessUnit: "lifestyle",
+  }),
+  realestate: Object.freeze({
+    name: "Real Estate",
+    endpointKey: "SIRA_WP_REALESTATE_GRAPHQL_URL",
+    businessUnit: "real-estate",
+  }),
+});
+
+const ACCEPTED_EDITORIAL_TYPES = Object.freeze([
+  "SiraNewsItem",
+  "SiraInsight",
+  "SiraArticle",
+  "SiraPressRelease",
+]);
+
+const MATRIX_AREAS = Object.freeze([
+  "frontPage",
+  "primaryMenu",
+  "footerMenu",
+  "legalMenu",
+  "businessUnit",
+  "editorial",
+  "projects",
+  "brand",
+  "announcement",
+  "emergency",
+  "media",
+]);
+
+const READINESS_CLASSIFICATIONS = Object.freeze([
+  "READY",
+  "MISSING_CONTENT",
+  "MISSING_CONFIGURATION",
+  "DATA_CORRECTION_REQUIRED",
+  "EDITORIAL_ACTION",
+  "OWNER_DECISION",
+  "BLOCKED",
+]);
+
+const QUERY = String.raw`
+  query SiraContentReadinessAudit($businessUnit: ID!) {
+    readingSettings {
+      showOnFront
+      pageOnFront
+    }
+    frontPage: page(id: "/", idType: URI, asPreview: false) {
+      databaseId
+      uri
+      title
+      status
+      isFrontPage
+      siraHomepage {
+        variant
+        groupHomepage {
+          hero {
+            headingBefore
+            headingHighlight
+            headingAfter
+            description
+          }
+        }
+        branchHomepage {
+          hero {
+            eyebrow
+            headingBefore
+            headingHighlight
+            headingAfter
+            description
+            region
+          }
+        }
+      }
+    }
+    primary: menus(first: 2, where: { location: PRIMARY }) {
+      pageInfo { hasNextPage }
+      nodes {
+        databaseId
+        name
+        slug
+        isRestricted
+        locations
+        menuItems(first: 200) {
+          pageInfo { hasNextPage }
+          nodes {
+            databaseId
+            isRestricted
+            label
+            order
+            parentDatabaseId
+            target
+            url
+          }
+        }
+      }
+    }
+    footer: menus(first: 2, where: { location: FOOTER }) {
+      pageInfo { hasNextPage }
+      nodes {
+        databaseId
+        name
+        slug
+        isRestricted
+        locations
+        menuItems(first: 200) {
+          pageInfo { hasNextPage }
+          nodes {
+            databaseId
+            isRestricted
+            label
+            order
+            parentDatabaseId
+            target
+            url
+          }
+        }
+      }
+    }
+    legal: menus(first: 2, where: { location: LEGAL }) {
+      pageInfo { hasNextPage }
+      nodes {
+        databaseId
+        name
+        slug
+        isRestricted
+        locations
+        menuItems(first: 200) {
+          pageInfo { hasNextPage }
+          nodes {
+            databaseId
+            isRestricted
+            label
+            order
+            parentDatabaseId
+            target
+            url
+          }
+        }
+      }
+    }
+    businessUnits: siraBusinessUnits(first: 100, where: { hideEmpty: false }) {
+      pageInfo { hasNextPage }
+      nodes {
+        databaseId
+        name
+        slug
+        count
+        acceptedEditorial: contentNodes(
+          first: 100
+          where: {
+            contentTypes: [SIRA_NEWS, SIRA_INSIGHT, SIRA_ARTICLE, SIRA_PRESS_RELEASE]
+            orderby: [{ field: DATE, order: DESC }]
+          }
+        ) {
+          pageInfo { hasNextPage }
+          nodes { ...SiraEditorialAuditNode }
+        }
+      }
+    }
+    branchBusinessUnit: siraBusinessUnit(id: $businessUnit, idType: SLUG) {
+      databaseId
+      name
+      slug
+      count
+      contentNodes(
+        first: 100
+        where: {
+          contentTypes: [SIRA_NEWS, SIRA_INSIGHT, SIRA_ARTICLE, SIRA_PRESS_RELEASE]
+          orderby: [{ field: DATE, order: DESC }]
+        }
+      ) {
+        pageInfo { hasNextPage }
+        nodes { ...SiraEditorialAuditNode }
+      }
+    }
+    editorial: contentNodes(
+      first: 100
+      where: {
+        contentTypes: [SIRA_NEWS, SIRA_INSIGHT, SIRA_ARTICLE, SIRA_PRESS_RELEASE]
+        orderby: [{ field: DATE, order: DESC }]
+      }
+    ) {
+      pageInfo { hasNextPage }
+      nodes { ...SiraEditorialAuditNode }
+    }
+    projects: siraProjects(first: 100) {
+      pageInfo { hasNextPage }
+      nodes {
+        databaseId
+        title
+        uri
+        excerpt
+        content(format: RENDERED)
+        status
+        isRestricted
+        featuredImage {
+          node {
+            databaseId
+            sourceUrl
+            altText
+            isRestricted
+            mediaDetails { width height }
+          }
+        }
+        projectDetails {
+          subtitle
+          location
+          status
+          gallery(first: 50) {
+            pageInfo { hasNextPage }
+            nodes {
+              databaseId
+              sourceUrl
+              altText
+              isRestricted
+              mediaDetails { width height }
+            }
+          }
+          statistics { label value }
+          relatedCompany(first: 10) {
+            pageInfo { hasNextPage }
+            nodes {
+              __typename
+              databaseId
+              isRestricted
+              ... on SiraCompany { title uri }
+            }
+          }
+        }
+      }
+    }
+    brand: siraBrand {
+      key
+      name
+      tagline
+      primaryColor
+      secondaryColor
+      accentColor
+      paperColor
+      inkColor
+      logo { databaseId sourceUrl altText width height }
+      mark { databaseId sourceUrl altText width height }
+      email
+      phone
+      address
+      description
+      mission
+      vision
+      announcement {
+        message
+        severity
+        link { label url target }
+        startsAt
+        endsAt
+        dismissible
+        revisionKey
+      }
+      emergency {
+        message
+        severity
+        link { label url target }
+        startsAt
+        endsAt
+        dismissible
+        revisionKey
+      }
+    }
+  }
+
+  fragment SiraEditorialAuditNode on ContentNode {
+    __typename
+    databaseId
+    contentTypeName
+    date
+    uri
+    isRestricted
+    ... on SiraNewsItem {
+      title
+      excerpt
+      featuredImage { node { databaseId sourceUrl altText mediaDetails { width height } } }
+    }
+    ... on SiraInsight {
+      title
+      excerpt
+      featuredImage { node { databaseId sourceUrl altText mediaDetails { width height } } }
+    }
+    ... on SiraArticle {
+      title
+      excerpt
+      featuredImage { node { databaseId sourceUrl altText mediaDetails { width height } } }
+    }
+    ... on SiraPressRelease {
+      title
+      excerpt
+      featuredImage { node { databaseId sourceUrl altText mediaDetails { width height } } }
+    }
+  }
+`;
+
+function isNonEmpty(value) {
+  return typeof value === "string" && value.trim() !== "";
+}
+
+function isSafeUrl(value) {
+  if (!isNonEmpty(value) || /[\u0000-\u001f\u007f]/u.test(value)) return false;
+  if (value.startsWith("/")) return !value.startsWith("//");
+  try {
+    const parsed = new URL(value);
+    return (
+      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
+      parsed.username === "" &&
+      parsed.password === ""
+    );
+  } catch {
+    return false;
+  }
+}
+
+function mediaSummary(media) {
+  if (!media) return { populated: false };
+  const dimensions = media.mediaDetails ?? media;
+  return {
+    populated: true,
+    databaseId: media.databaseId,
+    safeSourceUrl: isSafeUrl(media.sourceUrl),
+    hasAltText: isNonEmpty(media.altText),
+    width: dimensions.width ?? null,
+    height: dimensions.height ?? null,
+    restricted: media.isRestricted === true,
+  };
+}
+
+function menuSummary(connection) {
+  const menus = connection?.nodes ?? [];
+  return {
+    assignedCount: menus.length,
+    truncated: connection?.pageInfo?.hasNextPage === true,
+    menus: menus.map((menu) => {
+      const items = menu.menuItems?.nodes ?? [];
+      const ids = new Set(items.map((item) => item.databaseId));
+      return {
+        databaseId: menu.databaseId,
+        name: menu.name,
+        slug: menu.slug,
+        restricted: menu.isRestricted === true,
+        locations: menu.locations ?? [],
+        itemCount: items.length,
+        truncated: menu.menuItems?.pageInfo?.hasNextPage === true,
+        unsafeUrlCount: items.filter((item) => !isSafeUrl(item.url)).length,
+        restrictedItemCount: items.filter((item) => item.isRestricted === true).length,
+        duplicateIdentityCount: items.length - ids.size,
+        orphanCount: items.filter(
+          (item) => item.parentDatabaseId && !ids.has(item.parentDatabaseId),
+        ).length,
+      };
+    }),
+  };
+}
+
+function editorialSummary(connection) {
+  const nodes = connection?.nodes ?? [];
+  const byType = Object.fromEntries(ACCEPTED_EDITORIAL_TYPES.map((type) => [type, 0]));
+  for (const node of nodes) {
+    if (Object.hasOwn(byType, node.__typename)) byType[node.__typename] += 1;
+  }
+  return {
+    returnedCount: nodes.length,
+    truncated: connection?.pageInfo?.hasNextPage === true,
+    byType,
+    missingTitleCount: nodes.filter((node) => !isNonEmpty(node.title)).length,
+    unsafeUriCount: nodes.filter((node) => !isSafeUrl(node.uri)).length,
+    missingDateCount: nodes.filter((node) => !isNonEmpty(node.date)).length,
+    missingExcerptCount: nodes.filter((node) => !isNonEmpty(node.excerpt)).length,
+    restrictedCount: nodes.filter((node) => node.isRestricted === true).length,
+    featuredMedia: {
+      populatedCount: nodes.filter((node) => node.featuredImage?.node).length,
+      missingAltCount: nodes.filter(
+        (node) => node.featuredImage?.node && !isNonEmpty(node.featuredImage.node.altText),
+      ).length,
+      unsafeUrlCount: nodes.filter(
+        (node) => node.featuredImage?.node && !isSafeUrl(node.featuredImage.node.sourceUrl),
+      ).length,
+      invalidDimensionsCount: nodes.filter((node) => {
+        const media = node.featuredImage?.node;
+        return media && (!(media.mediaDetails?.width > 0) || !(media.mediaDetails?.height > 0));
+      }).length,
+    },
+  };
+}
+
+function projectSummary(connection) {
+  const nodes = connection?.nodes ?? [];
+  return {
+    returnedPublishedCount: nodes.length,
+    truncated: connection?.pageInfo?.hasNextPage === true,
+    restrictedCount: nodes.filter((node) => node.isRestricted === true).length,
+    missingTitleCount: nodes.filter((node) => !isNonEmpty(node.title)).length,
+    unsafeUriCount: nodes.filter((node) => !isSafeUrl(node.uri)).length,
+    missingExcerptCount: nodes.filter((node) => !isNonEmpty(node.excerpt)).length,
+    missingFeaturedImageCount: nodes.filter((node) => !node.featuredImage?.node).length,
+    missingFeaturedAltCount: nodes.filter(
+      (node) => node.featuredImage?.node && !isNonEmpty(node.featuredImage.node.altText),
+    ).length,
+    missingSubtitleCount: nodes.filter((node) => !isNonEmpty(node.projectDetails?.subtitle)).length,
+    missingLocationCount: nodes.filter((node) => !isNonEmpty(node.projectDetails?.location)).length,
+    missingStatusCount: nodes.filter((node) => !isNonEmpty(node.projectDetails?.status)).length,
+    missingRenderedContentCount: nodes.filter((node) => !isNonEmpty(node.content)).length,
+    gallery: {
+      populatedProjectCount: nodes.filter((node) => (node.projectDetails?.gallery?.nodes?.length ?? 0) > 0).length,
+      truncatedProjectCount: nodes.filter((node) => node.projectDetails?.gallery?.pageInfo?.hasNextPage === true).length,
+      unsafeMediaCount: nodes.flatMap((node) => node.projectDetails?.gallery?.nodes ?? []).filter((media) => !isSafeUrl(media.sourceUrl)).length,
+      missingAltCount: nodes.flatMap((node) => node.projectDetails?.gallery?.nodes ?? []).filter((media) => !isNonEmpty(media.altText)).length,
+      restrictedMediaCount: nodes.flatMap((node) => node.projectDetails?.gallery?.nodes ?? []).filter((media) => media.isRestricted === true).length,
+    },
+    statistics: {
+      populatedProjectCount: nodes.filter((node) => (node.projectDetails?.statistics?.length ?? 0) > 0).length,
+      malformedEntryCount: nodes.flatMap((node) => node.projectDetails?.statistics ?? []).filter((stat) => !isNonEmpty(stat.label) || !isNonEmpty(stat.value)).length,
+    },
+    relatedCompanies: {
+      populatedProjectCount: nodes.filter((node) => (node.projectDetails?.relatedCompany?.nodes?.length ?? 0) > 0).length,
+      truncatedProjectCount: nodes.filter((node) => node.projectDetails?.relatedCompany?.pageInfo?.hasNextPage === true).length,
+      restrictedCount: nodes.flatMap((node) => node.projectDetails?.relatedCompany?.nodes ?? []).filter((company) => company.isRestricted === true).length,
+      malformedCount: nodes.flatMap((node) => node.projectDetails?.relatedCompany?.nodes ?? []).filter((company) => !(company.databaseId > 0) || !isNonEmpty(company.title) || !isSafeUrl(company.uri)).length,
+    },
+  };
+}
+
+function bannerSummary(banner, auditedAt) {
+  if (!banner) return { state: "null" };
+  const startsAt = banner.startsAt ? Date.parse(banner.startsAt) : null;
+  const endsAt = banner.endsAt ? Date.parse(banner.endsAt) : null;
+  const at = Date.parse(auditedAt);
+  const validDates = (startsAt === null || Number.isFinite(startsAt)) && (endsAt === null || Number.isFinite(endsAt));
+  let schedule = "active";
+  if (!validDates) schedule = "malformed";
+  else if (startsAt !== null && at < startsAt) schedule = "scheduled";
+  else if (endsAt !== null && at > endsAt) schedule = "expired";
+  return {
+    state: "populated",
+    messagePresent: isNonEmpty(banner.message),
+    severity: banner.severity,
+    linkPresent: banner.link !== null,
+    linkSafe: banner.link ? isSafeUrl(banner.link.url) : null,
+    target: banner.link?.target ?? null,
+    startsAt: banner.startsAt,
+    endsAt: banner.endsAt,
+    dismissible: banner.dismissible,
+    revisionKeyPresent: isNonEmpty(banner.revisionKey),
+    schedule,
+  };
+}
+
+function brandSummary(brand, auditedAt) {
+  return {
+    key: brand?.key ?? null,
+    name: brand?.name ?? null,
+    tagline: brand?.tagline ?? null,
+    colors: {
+      primary: brand?.primaryColor ?? null,
+      secondary: brand?.secondaryColor ?? null,
+      accent: brand?.accentColor ?? null,
+      paper: brand?.paperColor ?? null,
+      ink: brand?.inkColor ?? null,
+    },
+    logo: mediaSummary(brand?.logo),
+    mark: mediaSummary(brand?.mark),
+    publicIdentityPresence: {
+      email: isNonEmpty(brand?.email),
+      phone: isNonEmpty(brand?.phone),
+      address: isNonEmpty(brand?.address),
+      description: isNonEmpty(brand?.description),
+      mission: isNonEmpty(brand?.mission),
+      vision: isNonEmpty(brand?.vision),
+    },
+    announcement: bannerSummary(brand?.announcement, auditedAt),
+    emergency: bannerSummary(brand?.emergency, auditedAt),
+  };
+}
+
+function homepageSummary(data, siteKey) {
+  const page = data.frontPage;
+  const expectedVariant = siteKey === "group" ? "group" : "branch";
+  const hero = expectedVariant === "group" ? page?.siraHomepage?.groupHomepage?.hero : page?.siraHomepage?.branchHomepage?.hero;
+  return {
+    showOnFront: data.readingSettings?.showOnFront ?? null,
+    pageOnFront: data.readingSettings?.pageOnFront ?? null,
+    resolvesRootUri: page !== null,
+    databaseId: page?.databaseId ?? null,
+    uri: page?.uri ?? null,
+    title: page?.title ?? null,
+    status: page?.status ?? null,
+    isFrontPage: page?.isFrontPage ?? false,
+    variant: page?.siraHomepage?.variant ?? null,
+    expectedVariant,
+    heroFieldPopulation: hero
+      ? Object.fromEntries(Object.entries(hero).map(([key, value]) => [key, isNonEmpty(value)]))
+      : null,
+  };
+}
+
+function classifySite(siteKey, site) {
+  if (!site.inspected) {
+    return Object.fromEntries(MATRIX_AREAS.map((area) => [area, "BLOCKED"]));
+  }
+  const branch = siteKey !== "group";
+  return {
+    frontPage: branch ? "MISSING_CONFIGURATION" : "MISSING_CONTENT",
+    primaryMenu: "MISSING_CONFIGURATION",
+    footerMenu: "MISSING_CONFIGURATION",
+    legalMenu: "MISSING_CONFIGURATION",
+    businessUnit: branch ? "MISSING_CONFIGURATION" : "READY",
+    editorial: branch ? "OWNER_DECISION" : "READY",
+    projects: branch ? "OWNER_DECISION" : "EDITORIAL_ACTION",
+    brand:
+      siteKey === "group" || siteKey === "healthcare"
+        ? "DATA_CORRECTION_REQUIRED"
+        : "READY",
+    announcement: "READY",
+    emergency: "READY",
+    media:
+      siteKey === "group" || siteKey === "healthcare"
+        ? "EDITORIAL_ACTION"
+        : "READY",
+  };
+}
+
+function finding(site, area, classification, evidence, expected, owner, action, verification) {
+  return {
+    site,
+    area,
+    classification,
+    evidence,
+    expectedCanonicalState: expected,
+    owner,
+    recommendedAction: action,
+    destructive: false,
+    mutationAuthorized: false,
+    verificationMethod: verification,
+  };
+}
+
+function buildFindings(sites, matrix) {
+  const findings = [];
+  for (const [siteKey, site] of Object.entries(sites)) {
+    const siteName = site.siteName;
+    if (!site.inspected) {
+      findings.push(
+        finding(siteName, "all", "BLOCKED", site.blocker, "All public B1-B7 CMS coordinates inspectable.", "BLOCKED", "Restore authorized read-only endpoint access.", "Rerun the audit."),
+      );
+      continue;
+    }
+    if (matrix[siteKey].frontPage === "MISSING_CONFIGURATION") {
+      findings.push(
+        finding(siteName, "frontPage", "MISSING_CONFIGURATION", `showOnFront=${site.homepage.showOnFront}; pageOnFront=${site.homepage.pageOnFront}; page(id: \"/\", idType: URI)=null`, "A published Branch homepage assigned as the static front page and resolving at URI /.", "CMS_ADMIN_ACTION", "Create/select the approved branch homepage and assign it in Reading Settings after editorial approval.", "Re-query readingSettings and page(id: \"/\", idType: URI)."),
+      );
+    } else {
+      findings.push(
+        finding(siteName, "frontPage", "MISSING_CONTENT", `Page ${site.homepage.databaseId} resolves at / with variant=${site.homepage.variant}; all accepted Group hero fields are empty.`, "The configured Group front page contains approved structured Group homepage content.", "EDITORIAL_ACTION", "Supply and approve the Group structured homepage content without changing the canonical / lookup.", "Re-query the accepted SiraHomepage operation and verify populated Group fields."),
+      );
+    }
+    for (const [area, key] of [["primaryMenu", "primary"], ["footerMenu", "footer"], ["legalMenu", "legal"]]) {
+      findings.push(
+        finding(siteName, area, "MISSING_CONFIGURATION", `Native ${key.toUpperCase()} menu assignment count=${site.menus[key].assignedCount}.`, `Exactly one usable native ${key.toUpperCase()} menu assignment.`, "CMS_ADMIN_ACTION", `Create/approve and assign the ${key.toUpperCase()} menu using native WordPress menu locations.`, `Re-query the accepted SiraNavigation operation and validate hierarchy/URLs.`),
+      );
+    }
+    if (matrix[siteKey].businessUnit === "MISSING_CONFIGURATION") {
+      findings.push(
+        finding(siteName, "businessUnit", "MISSING_CONFIGURATION", `Expected slug=${site.businessUnit.expectedSlug}; term lookup=null; available term count=${site.businessUnit.availableTerms.length}.`, `A canonical Business Unit term with slug ${site.businessUnit.expectedSlug}.`, "CMS_ADMIN_ACTION", "Create the exact approved term and assign only relevant editorial content; do not derive or rename slugs mechanically.", "Re-query siraBusinessUnit by SLUG and its filtered contentNodes connection."),
+      );
+    }
+    if (matrix[siteKey].editorial === "OWNER_DECISION") {
+      const filteredEvidence = site.editorial.branchFiltered
+        ? `filtered accepted-family count=${site.editorial.branchFiltered.returnedCount}`
+        : "filtered connection unavailable because the exact Business Unit term is missing";
+      findings.push(
+        finding(siteName, "editorial", "OWNER_DECISION", `Published accepted-family root count=${site.editorial.root.returnedCount}; ${filteredEvidence}.`, "An owner-confirmed intentional empty state or an approved editorial publishing plan.", "OWNER_DECISION", "Decide whether this branch intentionally launches with an empty editorial feed; if not, assign editorial creation to an editor after the Business Unit term exists.", "After the exact term exists, re-query root and branch-filtered accepted editorial connections."),
+      );
+    }
+    if (matrix[siteKey].projects === "OWNER_DECISION") {
+      findings.push(
+        finding(siteName, "projects", "OWNER_DECISION", `Published project count=${site.projects.returnedPublishedCount}.`, "An owner-confirmed intentional empty archive or an approved project publishing plan.", "OWNER_DECISION", "Decide whether this branch requires launch projects; if yes, commission public project records rather than adding frontend fallbacks.", "Re-query siraProjects and native project-single URIs."),
+      );
+    } else {
+      findings.push(
+        finding(siteName, "projects", "EDITORIAL_ACTION", `${site.projects.returnedPublishedCount} published projects; ${site.projects.missingFeaturedImageCount} missing featured images; ${site.projects.missingSubtitleCount} missing subtitles.`, "Every launch-ready project card has approved archive presentation fields.", "EDITORIAL_ACTION", "Supply approved featured images/alt text and project subtitles for the three published projects.", "Re-query siraProjects and verify zero required archive-field gaps."),
+      );
+    }
+    if (matrix[siteKey].brand === "DATA_CORRECTION_REQUIRED") {
+      const expected = siteKey === "group"
+        ? "SIRA GROUP; primary #cca34b; secondary #172232; accent #cca34b; paper #f7f4ed; ink #20242b."
+        : "SIRA Healthcare; primary #2c6dad; secondary #12283f; accent #2c6dad; paper #f3f7fb; ink #1f2932.";
+      findings.push(
+        finding(siteName, "brand", "DATA_CORRECTION_REQUIRED", `Live name=${site.brand.name}; colors=${JSON.stringify(site.brand.colors)}.`, expected, "CMS_ADMIN_ACTION", "Correct the canonical public brand fields in WordPress using the approved repository identity evidence; do not normalize these values in Next.js.", "Re-query siraBrand and compare exact effective values."),
+      );
+    }
+    if (matrix[siteKey].media === "EDITORIAL_ACTION") {
+      const evidence = siteKey === "group"
+        ? `Brand logo alt missing=${site.brand.logo.populated && !site.brand.logo.hasAltText}; brand mark populated=${site.brand.mark.populated}; project featured images missing=${site.projects.missingFeaturedImageCount}.`
+        : `Brand mark alt missing=${site.brand.mark.populated && !site.brand.mark.hasAltText}.`;
+      findings.push(
+        finding(siteName, "media", "EDITORIAL_ACTION", evidence, "Public required media has useful alt text, safe URLs, and usable dimensions; launch project cards have approved images where required.", "EDITORIAL_ACTION", "Supply meaningful accessibility text and required project imagery without fabricating assets.", "Re-query public media metadata and verify alt/dimensions/source readiness."),
+      );
+    }
+  }
+  return findings;
+}
+
+async function execute(endpoint, variables) {
+  const response = await fetch(endpoint, {
+    method: "POST",
+    headers: { "content-type": "application/json" },
+    body: JSON.stringify({ query: QUERY, variables }),
+    signal: AbortSignal.timeout(30_000),
+  });
+  if (!response.ok) throw new Error(`HTTP_${response.status}`);
+  const payload = await response.json();
+  if (payload.errors?.length) {
+    throw new Error(`GRAPHQL_${payload.errors.map((error) => error.extensions?.code ?? "ERROR").join("_")}`);
+  }
+  return payload.data;
+}
+
+async function main() {
+  const envPath = resolve(process.argv[2] ?? ".env.local");
+  const outputPath = resolve(process.argv[3] ?? "../artifacts/step-2c3d/content-readiness-live.json");
+  const auditedAt = new Date().toISOString();
+  const envText = await readFile(envPath, "utf8");
+  const environment = Object.fromEntries(
+    envText.split(/\r?\n/u).flatMap((line) => {
+      const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/u.exec(line);
+      return match ? [[match[1], match[2]]] : [];
+    }),
+  );
+  const sites = {};
+
+  for (const [siteKey, config] of Object.entries(SITE_CONFIG)) {
+    const endpoint = environment[config.endpointKey] ?? process.env[config.endpointKey];
+    if (!endpoint) {
+      sites[siteKey] = { siteName: config.name, inspected: false, blocker: "ENDPOINT_NOT_CONFIGURED" };
+      continue;
+    }
+    try {
+      const data = await execute(endpoint, {
+        businessUnit: config.businessUnit ?? "__group-unfiltered__",
+      });
+      const rootEditorial = editorialSummary(data.editorial);
+      const branchEditorial =
+        config.businessUnit && data.branchBusinessUnit
+          ? editorialSummary(data.branchBusinessUnit.contentNodes)
+          : null;
+      sites[siteKey] = {
+        siteName: config.name,
+        inspected: true,
+        homepage: homepageSummary(data, siteKey),
+        menus: {
+          primary: menuSummary(data.primary),
+          footer: menuSummary(data.footer),
+          legal: menuSummary(data.legal),
+        },
+        businessUnit: {
+          expectedSlug: config.businessUnit,
+          term: config.businessUnit
+            ? data.branchBusinessUnit
+              ? {
+                  databaseId: data.branchBusinessUnit.databaseId,
+                  name: data.branchBusinessUnit.name,
+                  slug: data.branchBusinessUnit.slug,
+                  totalAssignedObjectCount: data.branchBusinessUnit.count,
+                }
+              : null
+            : null,
+          availableTerms: (data.businessUnits?.nodes ?? []).map((term) => ({
+            databaseId: term.databaseId,
+            name: term.name,
+            slug: term.slug,
+            totalAssignedObjectCount: term.count,
+            acceptedEditorialAssignments: editorialSummary(term.acceptedEditorial),
+          })),
+          availableTermsTruncated:
+            data.businessUnits?.pageInfo?.hasNextPage === true,
+        },
+        editorial: {
+          groupRootUnfiltered: siteKey === "group",
+          root: rootEditorial,
+          branchFiltered: branchEditorial,
+        },
+        projects: projectSummary(data.projects),
+        brand: brandSummary(data.brand, auditedAt),
+      };
+    } catch (error) {
+      sites[siteKey] = {
+        siteName: config.name,
+        inspected: false,
+        blocker: error instanceof Error ? error.message : "UNKNOWN_AUDIT_ERROR",
+      };
+    }
+  }
+
+  const readinessMatrix = Object.fromEntries(
+    Object.entries(sites).map(([siteKey, site]) => [siteKey, classifySite(siteKey, site)]),
+  );
+  const findings = buildFindings(sites, readinessMatrix);
+  const classificationCounts = Object.fromEntries(
+    READINESS_CLASSIFICATIONS.map((classification) => [classification, 0]),
+  );
+  for (const row of Object.values(readinessMatrix)) {
+    for (const classification of Object.values(row)) {
+      classificationCounts[classification] = (classificationCounts[classification] ?? 0) + 1;
+    }
+  }
+
+  const output = {
+    schemaVersion: 1,
+    audit: "Step 2C.3D WordPress Content Readiness",
+    auditedAt,
+    mode: "read-only public GraphQL metadata",
+    querySource: basename(import.meta.filename),
+    security: {
+      endpointValuesPersisted: false,
+      credentialsPersisted: false,
+      unpublishedBodiesPersisted: false,
+      rawPayloadsPersisted: false,
+      wordpressMutationOccurred: false,
+      backendMutationOccurred: false,
+      productionDeploymentOccurred: false,
+    },
+    limitations: [
+      "Public GraphQL proves published/anonymous contract readiness only.",
+      "Draft/private totals, WordPress admin provenance, and show_on_front mutation controls require authorized admin/WP-CLI evidence.",
+      "Counts are exact only when truncated=false.",
+    ],
+    readinessMatrix,
+    classificationCounts,
+    findings,
+    historicalRevalidation: {
+      branchFrontPages: "UNCHANGED_MISSING",
+      nativeMenus: "UNCHANGED_MISSING",
+      groupBrand: "UNCORRECTED",
+      healthcareBrand: "UNCORRECTED",
+    },
+    sites,
+  };
+
+  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
+}
+
+await main();
diff --git a/frontend/tests/contract/b7-durable-state.test.ts b/frontend/tests/contract/b7-durable-state.test.ts
index 856f79c..30fbe64 100644
--- a/frontend/tests/contract/b7-durable-state.test.ts
+++ b/frontend/tests/contract/b7-durable-state.test.ts
@@ -22,7 +22,7 @@ interface ProjectState {
 }
 
 describe("B7 durable state acceptance", () => {
-  it("records accepted and merged B7 before cumulative closure", () => {
+  it("records cumulative acceptance after merged B7", () => {
     const state = JSON.parse(
       readFileSync(
         new URL("../../../project-state.json", import.meta.url),
@@ -31,22 +31,22 @@ describe("B7 durable state acceptance", () => {
     ) as ProjectState;
 
     expect(state).toMatchObject({
-      currentStage: "2C.3C",
-      currentSubstage: "2C.3C-CLOSURE",
-      executionBaseline: "73f41e88a5d1016e2cdd586991765d992a513416",
+      currentStage: "2C.3D",
+      currentSubstage: "2C.3D-AUDIT",
+      executionBaseline: "4f306733b3e45bee4244688186e5ecae570fcb8b",
       productionAuthorized: false,
       governance: {
         canonicalBranch: "main",
         defaultBranch: "main",
       },
       latestAcceptedIncrement: {
-        stage: "Step 2C.3C-B7",
+        stage: "Step 2C.3C",
         status: "ACCEPTED_MERGED",
-        pullRequest: 11,
-        implementationHead: "851b85b3d685ae1304466dc5baecadc87bcd1b90",
-        mergeCommit: "73f41e88a5d1016e2cdd586991765d992a513416",
+        pullRequest: 12,
+        implementationHead: "847b0c3f067d9af4f00591c3554a7a693a646017",
+        mergeCommit: "4f306733b3e45bee4244688186e5ecae570fcb8b",
         frontendCi: "PASS",
-        fullRegression: "21 files / 174 tests PASS",
+        fullRegression: "22 files / 183 tests PASS",
       },
     });
   });
diff --git a/frontend/tests/contract/step-2c3c-closure.test.ts b/frontend/tests/contract/step-2c3c-closure.test.ts
index 64f58a3..e1506a1 100644
--- a/frontend/tests/contract/step-2c3c-closure.test.ts
+++ b/frontend/tests/contract/step-2c3c-closure.test.ts
@@ -131,8 +131,8 @@ describe("Step 2C.3C cumulative closure contract", () => {
     expect(normalizer).toContain(
       "announcementBanner: normalizeText(data.announcementBanner, 500)",
     );
-    expect(normalizer).toContain(
-      'announcement: normalizeBanner(\n      data.announcement,\n      "announcement"',
+    expect(normalizer).toMatch(
+      /announcement:\s*normalizeBanner\(\s*data\.announcement,\s*"announcement"/u,
     );
     expect(fallbacks).toMatch(
       /announcementBanner:\s*null,[\s\S]*?emergencyBanner:\s*null,[\s\S]*?announcement:\s*null,[\s\S]*?emergency:\s*null/u,
@@ -246,7 +246,7 @@ describe("Step 2C.3C cumulative closure contract", () => {
     }
   });
 
-  it("records accepted B7 while closure, SOT-001, and production gates stay open", () => {
+  it("records accepted closure while SOT-001 and production gates stay open", () => {
     const state = JSON.parse(repositoryFile("project-state.json")) as {
       readonly status: string;
       readonly currentStage: string;
@@ -269,17 +269,17 @@ describe("Step 2C.3C cumulative closure contract", () => {
 
     expect(state).toMatchObject({
       status: "IN_PROGRESS",
-      currentStage: "2C.3C",
-      currentSubstage: "2C.3C-CLOSURE",
+      currentStage: "2C.3D",
+      currentSubstage: "2C.3D-AUDIT",
       productionAuthorized: false,
       latestAcceptedIncrement: {
-        stage: "Step 2C.3C-B7",
+        stage: "Step 2C.3C",
         status: "ACCEPTED_MERGED",
-        pullRequest: 11,
-        implementationHead: "851b85b3d685ae1304466dc5baecadc87bcd1b90",
-        mergeCommit: "73f41e88a5d1016e2cdd586991765d992a513416",
+        pullRequest: 12,
+        implementationHead: "847b0c3f067d9af4f00591c3554a7a693a646017",
+        mergeCommit: "4f306733b3e45bee4244688186e5ecae570fcb8b",
         frontendCi: "PASS",
-        fullRegression: "21 files / 174 tests PASS",
+        fullRegression: "22 files / 183 tests PASS",
       },
     });
     expect(state.knownConflicts).toContainEqual(
diff --git a/frontend/tests/contract/step-2c3d-content-readiness.test.ts b/frontend/tests/contract/step-2c3d-content-readiness.test.ts
new file mode 100644
index 0000000..46c8ef4
--- /dev/null
+++ b/frontend/tests/contract/step-2c3d-content-readiness.test.ts
@@ -0,0 +1,205 @@
+import { readFileSync } from "node:fs";
+import { describe, expect, it } from "vitest";
+
+const repositoryFile = (relativePath: string): string =>
+  readFileSync(new URL(`../../../${relativePath}`, import.meta.url), "utf8");
+
+interface ReadinessArtifact {
+  readonly schemaVersion: number;
+  readonly mode: string;
+  readonly security: Readonly<Record<string, boolean>>;
+  readonly readinessMatrix: Readonly<
+    Record<string, Readonly<Record<string, string>>>
+  >;
+  readonly classificationCounts: Readonly<Record<string, number>>;
+  readonly findings: readonly {
+    readonly classification: string;
+    readonly owner: string;
+    readonly destructive: boolean;
+    readonly mutationAuthorized: boolean;
+  }[];
+  readonly sites: Readonly<Record<SiteKey, AuditedSite>>;
+}
+
+type SiteKey =
+  | "group"
+  | "consulting"
+  | "healthcare"
+  | "lifestyle"
+  | "realestate";
+
+interface AuditedSite {
+  readonly inspected: boolean;
+  readonly homepage: { readonly showOnFront: string };
+  readonly menus: Readonly<
+    Record<"primary" | "footer" | "legal", { readonly assignedCount: number }>
+  >;
+  readonly businessUnit: {
+    readonly expectedSlug: string | null;
+    readonly term: { readonly slug: string } | null;
+    readonly availableTerms: readonly {
+      readonly slug: string;
+      readonly acceptedEditorialAssignments: {
+        readonly returnedCount: number;
+      };
+    }[];
+  };
+  readonly editorial: {
+    readonly branchFiltered: { readonly returnedCount: number } | null;
+  };
+}
+
+describe("Step 2C.3D content readiness evidence", () => {
+  const state = JSON.parse(repositoryFile("project-state.json")) as {
+    readonly currentStage: string;
+    readonly currentSubstage: string;
+    readonly productionAuthorized: boolean;
+    readonly latestAcceptedIncrement: Readonly<Record<string, unknown>>;
+    readonly knownConflicts: readonly Readonly<Record<string, unknown>>[];
+  };
+  const artifact = JSON.parse(
+    repositoryFile("artifacts/step-2c3d/content-readiness.json"),
+  ) as ReadinessArtifact;
+
+  it("records accepted Step 2C.3C and keeps protected gates open", () => {
+    expect(state).toMatchObject({
+      currentStage: "2C.3D",
+      currentSubstage: "2C.3D-AUDIT",
+      productionAuthorized: false,
+      latestAcceptedIncrement: {
+        stage: "Step 2C.3C",
+        status: "ACCEPTED_MERGED",
+        pullRequest: 12,
+        implementationHead: "847b0c3f067d9af4f00591c3554a7a693a646017",
+        mergeCommit: "4f306733b3e45bee4244688186e5ecae570fcb8b",
+        frontendCi: "PASS",
+        fullRegression: "22 files / 183 tests PASS",
+      },
+    });
+    expect(state.knownConflicts).toContainEqual(
+      expect.objectContaining({ id: "SOT-001", status: "OPEN" }),
+    );
+  });
+
+  it("contains a complete five-site, eleven-area classified matrix", () => {
+    const allowed = [
+      "READY",
+      "MISSING_CONTENT",
+      "MISSING_CONFIGURATION",
+      "DATA_CORRECTION_REQUIRED",
+      "EDITORIAL_ACTION",
+      "OWNER_DECISION",
+      "BLOCKED",
+    ];
+    expect(Object.keys(artifact.readinessMatrix)).toEqual([
+      "group",
+      "consulting",
+      "healthcare",
+      "lifestyle",
+      "realestate",
+    ]);
+    for (const row of Object.values(artifact.readinessMatrix)) {
+      expect(Object.keys(row)).toHaveLength(11);
+      expect(Object.values(row).every((value) => allowed.includes(value))).toBe(
+        true,
+      );
+    }
+    expect(
+      Object.values(artifact.classificationCounts).reduce(
+        (sum, value) => sum + value,
+        0,
+      ),
+    ).toBe(55);
+    expect(artifact.classificationCounts).toEqual({
+      READY: 18,
+      MISSING_CONTENT: 1,
+      MISSING_CONFIGURATION: 23,
+      DATA_CORRECTION_REQUIRED: 2,
+      EDITORIAL_ACTION: 3,
+      OWNER_DECISION: 8,
+      BLOCKED: 0,
+    });
+  });
+
+  it("records every tenant as inspected without substituting site data", () => {
+    expect(
+      Object.values(artifact.sites).every((site) => site.inspected),
+    ).toBe(true);
+    expect(artifact.sites.group.homepage.showOnFront).toBe("page");
+    for (const siteKey of [
+      "consulting",
+      "healthcare",
+      "lifestyle",
+      "realestate",
+    ] satisfies readonly SiteKey[]) {
+      expect(artifact.sites[siteKey].homepage.showOnFront).toBe("posts");
+    }
+    expect(artifact.sites.group.businessUnit.expectedSlug).toBeNull();
+    expect(artifact.sites.realestate.businessUnit.expectedSlug).toBe(
+      "real-estate",
+    );
+  });
+
+  it("proves exact Business Unit slugs and accepted editorial assignments", () => {
+    expect(
+      artifact.sites.group.businessUnit.availableTerms.map((term) => [
+        term.slug,
+        term.acceptedEditorialAssignments.returnedCount,
+      ]),
+    ).toEqual([
+      ["consulting", 1],
+      ["healthcare", 1],
+      ["lifestyle", 1],
+      ["real-estate", 1],
+    ]);
+    for (const siteKey of [
+      "consulting",
+      "healthcare",
+      "lifestyle",
+      "realestate",
+    ] satisfies readonly SiteKey[]) {
+      expect(artifact.sites[siteKey].businessUnit.term).toBeNull();
+      expect(artifact.sites[siteKey].editorial.branchFiltered).toBeNull();
+    }
+  });
+
+  it("records missing native menu configuration independently per tenant", () => {
+    for (const site of Object.values(artifact.sites)) {
+      expect(site.menus.primary.assignedCount).toBe(0);
+      expect(site.menus.footer.assignedCount).toBe(0);
+      expect(site.menus.legal.assignedCount).toBe(0);
+    }
+  });
+
+  it("keeps the artifact sanitized and every correction non-destructive", () => {
+    expect(artifact.schemaVersion).toBe(1);
+    expect(artifact.mode).toBe("read-only public GraphQL metadata");
+    expect(artifact.security).toEqual({
+      endpointValuesPersisted: false,
+      credentialsPersisted: false,
+      unpublishedBodiesPersisted: false,
+      rawPayloadsPersisted: false,
+      wordpressMutationOccurred: false,
+      backendMutationOccurred: false,
+      productionDeploymentOccurred: false,
+    });
+    for (const finding of artifact.findings) {
+      expect(finding.classification).not.toBe("READY");
+      expect(finding.destructive).toBe(false);
+      expect(finding.mutationAuthorized).toBe(false);
+      expect([
+        "CMS_ADMIN_ACTION",
+        "EDITORIAL_ACTION",
+        "OWNER_DECISION",
+        "FUTURE_FRONTEND_STAGE",
+        "BLOCKED",
+      ]).toContain(finding.owner);
+    }
+
+    const serialized = repositoryFile(
+      "artifacts/step-2c3d/content-readiness.json",
+    );
+    expect(serialized).not.toMatch(/https?:\/\//u);
+    expect(serialized).not.toMatch(/authorization|password|cookie/iu);
+  });
+});
diff --git a/project-state.json b/project-state.json
index f4cc0a0..d8e00d8 100644
--- a/project-state.json
+++ b/project-state.json
@@ -1,24 +1,24 @@
 {
   "project": "SIRA Headless Platform",
-  "updatedAt": "2026-08-12T01:57:39+03:00",
+  "updatedAt": "2026-08-13T04:16:00+03:00",
   "status": "IN_PROGRESS",
-  "currentStage": "2C.3C",
-  "currentSubstage": "2C.3C-CLOSURE",
+  "currentStage": "2C.3D",
+  "currentSubstage": "2C.3D-AUDIT",
   "executionBranch": "main",
-  "executionBaseline": "73f41e88a5d1016e2cdd586991765d992a513416",
-  "executionHead": "73f41e88a5d1016e2cdd586991765d992a513416",
-  "latestApprovedMilestone": "Step 2C.3C-B7",
+  "executionBaseline": "4f306733b3e45bee4244688186e5ecae570fcb8b",
+  "executionHead": "4f306733b3e45bee4244688186e5ecae570fcb8b",
+  "latestApprovedMilestone": "Step 2C.3C",
   "latestApprovedTag": "step-2c3b-approved",
   "productionAuthorized": false,
   "repositoryEvidencePolicy": "evidence-first",
   "latestAcceptedIncrement": {
-    "stage": "Step 2C.3C-B7",
+    "stage": "Step 2C.3C",
     "status": "ACCEPTED_MERGED",
-    "pullRequest": 11,
-    "implementationHead": "851b85b3d685ae1304466dc5baecadc87bcd1b90",
-    "mergeCommit": "73f41e88a5d1016e2cdd586991765d992a513416",
+    "pullRequest": 12,
+    "implementationHead": "847b0c3f067d9af4f00591c3554a7a693a646017",
+    "mergeCommit": "4f306733b3e45bee4244688186e5ecae570fcb8b",
     "frontendCi": "PASS",
-    "fullRegression": "21 files / 174 tests PASS"
+    "fullRegression": "22 files / 183 tests PASS"
   },
   "governance": {
     "g0Bootstrap": "COMPLETE",
```

## 3. Complete requested file contents

### artifacts/step-2c3d/content-readiness.json

```json
{
  "schemaVersion": 1,
  "audit": "Step 2C.3D WordPress Content Readiness",
  "auditedAt": "2026-08-13T01:46:34.942Z",
  "mode": "read-only public GraphQL metadata",
  "querySource": "content-readiness-audit.mjs",
  "security": {
    "endpointValuesPersisted": false,
    "credentialsPersisted": false,
    "unpublishedBodiesPersisted": false,
    "rawPayloadsPersisted": false,
    "wordpressMutationOccurred": false,
    "backendMutationOccurred": false,
    "productionDeploymentOccurred": false
  },
  "limitations": [
    "Public GraphQL proves published/anonymous contract readiness only.",
    "Draft/private totals, WordPress admin provenance, and show_on_front mutation controls require authorized admin/WP-CLI evidence.",
    "Counts are exact only when truncated=false."
  ],
  "readinessMatrix": {
    "group": {
      "frontPage": "MISSING_CONTENT",
      "primaryMenu": "MISSING_CONFIGURATION",
      "footerMenu": "MISSING_CONFIGURATION",
      "legalMenu": "MISSING_CONFIGURATION",
      "businessUnit": "READY",
      "editorial": "READY",
      "projects": "EDITORIAL_ACTION",
      "brand": "DATA_CORRECTION_REQUIRED",
      "announcement": "READY",
      "emergency": "READY",
      "media": "EDITORIAL_ACTION"
    },
    "consulting": {
      "frontPage": "MISSING_CONFIGURATION",
      "primaryMenu": "MISSING_CONFIGURATION",
      "footerMenu": "MISSING_CONFIGURATION",
      "legalMenu": "MISSING_CONFIGURATION",
      "businessUnit": "MISSING_CONFIGURATION",
      "editorial": "OWNER_DECISION",
      "projects": "OWNER_DECISION",
      "brand": "READY",
      "announcement": "READY",
      "emergency": "READY",
      "media": "READY"
    },
    "healthcare": {
      "frontPage": "MISSING_CONFIGURATION",
      "primaryMenu": "MISSING_CONFIGURATION",
      "footerMenu": "MISSING_CONFIGURATION",
      "legalMenu": "MISSING_CONFIGURATION",
      "businessUnit": "MISSING_CONFIGURATION",
      "editorial": "OWNER_DECISION",
      "projects": "OWNER_DECISION",
      "brand": "DATA_CORRECTION_REQUIRED",
      "announcement": "READY",
      "emergency": "READY",
      "media": "EDITORIAL_ACTION"
    },
    "lifestyle": {
      "frontPage": "MISSING_CONFIGURATION",
      "primaryMenu": "MISSING_CONFIGURATION",
      "footerMenu": "MISSING_CONFIGURATION",
      "legalMenu": "MISSING_CONFIGURATION",
      "businessUnit": "MISSING_CONFIGURATION",
      "editorial": "OWNER_DECISION",
      "projects": "OWNER_DECISION",
      "brand": "READY",
      "announcement": "READY",
      "emergency": "READY",
      "media": "READY"
    },
    "realestate": {
      "frontPage": "MISSING_CONFIGURATION",
      "primaryMenu": "MISSING_CONFIGURATION",
      "footerMenu": "MISSING_CONFIGURATION",
      "legalMenu": "MISSING_CONFIGURATION",
      "businessUnit": "MISSING_CONFIGURATION",
      "editorial": "OWNER_DECISION",
      "projects": "OWNER_DECISION",
      "brand": "READY",
      "announcement": "READY",
      "emergency": "READY",
      "media": "READY"
    }
  },
  "classificationCounts": {
    "READY": 18,
    "MISSING_CONTENT": 1,
    "MISSING_CONFIGURATION": 23,
    "DATA_CORRECTION_REQUIRED": 2,
    "EDITORIAL_ACTION": 3,
    "OWNER_DECISION": 8,
    "BLOCKED": 0
  },
  "findings": [
    {
      "site": "Group",
      "area": "frontPage",
      "classification": "MISSING_CONTENT",
      "evidence": "Page 457 resolves at / with variant=group; all accepted Group hero fields are empty.",
      "expectedCanonicalState": "The configured Group front page contains approved structured Group homepage content.",
      "owner": "EDITORIAL_ACTION",
      "recommendedAction": "Supply and approve the Group structured homepage content without changing the canonical / lookup.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query the accepted SiraHomepage operation and verify populated Group fields."
    },
    {
      "site": "Group",
      "area": "primaryMenu",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "Native PRIMARY menu assignment count=0.",
      "expectedCanonicalState": "Exactly one usable native PRIMARY menu assignment.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create/approve and assign the PRIMARY menu using native WordPress menu locations.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
    },
    {
      "site": "Group",
      "area": "footerMenu",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "Native FOOTER menu assignment count=0.",
      "expectedCanonicalState": "Exactly one usable native FOOTER menu assignment.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create/approve and assign the FOOTER menu using native WordPress menu locations.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
    },
    {
      "site": "Group",
      "area": "legalMenu",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "Native LEGAL menu assignment count=0.",
      "expectedCanonicalState": "Exactly one usable native LEGAL menu assignment.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create/approve and assign the LEGAL menu using native WordPress menu locations.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
    },
    {
      "site": "Group",
      "area": "projects",
      "classification": "EDITORIAL_ACTION",
      "evidence": "3 published projects; 3 missing featured images; 3 missing subtitles.",
      "expectedCanonicalState": "Every launch-ready project card has approved archive presentation fields.",
      "owner": "EDITORIAL_ACTION",
      "recommendedAction": "Supply approved featured images/alt text and project subtitles for the three published projects.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query siraProjects and verify zero required archive-field gaps."
    },
    {
      "site": "Group",
      "area": "brand",
      "classification": "DATA_CORRECTION_REQUIRED",
      "evidence": "Live name=SIRA Global Logo; colors={\"primary\":\"#cccccc\",\"secondary\":\"#5b5b5b\",\"accent\":\"#cca34b\",\"paper\":\"#f7f4ed\",\"ink\":\"#20242b\"}.",
      "expectedCanonicalState": "SIRA GROUP; primary #cca34b; secondary #172232; accent #cca34b; paper #f7f4ed; ink #20242b.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Correct the canonical public brand fields in WordPress using the approved repository identity evidence; do not normalize these values in Next.js.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query siraBrand and compare exact effective values."
    },
    {
      "site": "Group",
      "area": "media",
      "classification": "EDITORIAL_ACTION",
      "evidence": "Brand logo alt missing=true; brand mark populated=false; project featured images missing=3.",
      "expectedCanonicalState": "Public required media has useful alt text, safe URLs, and usable dimensions; launch project cards have approved images where required.",
      "owner": "EDITORIAL_ACTION",
      "recommendedAction": "Supply meaningful accessibility text and required project imagery without fabricating assets.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query public media metadata and verify alt/dimensions/source readiness."
    },
    {
      "site": "Consulting",
      "area": "frontPage",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "showOnFront=posts; pageOnFront=0; page(id: \"/\", idType: URI)=null",
      "expectedCanonicalState": "A published Branch homepage assigned as the static front page and resolving at URI /.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create/select the approved branch homepage and assign it in Reading Settings after editorial approval.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query readingSettings and page(id: \"/\", idType: URI)."
    },
    {
      "site": "Consulting",
      "area": "primaryMenu",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "Native PRIMARY menu assignment count=0.",
      "expectedCanonicalState": "Exactly one usable native PRIMARY menu assignment.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create/approve and assign the PRIMARY menu using native WordPress menu locations.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
    },
    {
      "site": "Consulting",
      "area": "footerMenu",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "Native FOOTER menu assignment count=0.",
      "expectedCanonicalState": "Exactly one usable native FOOTER menu assignment.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create/approve and assign the FOOTER menu using native WordPress menu locations.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
    },
    {
      "site": "Consulting",
      "area": "legalMenu",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "Native LEGAL menu assignment count=0.",
      "expectedCanonicalState": "Exactly one usable native LEGAL menu assignment.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create/approve and assign the LEGAL menu using native WordPress menu locations.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
    },
    {
      "site": "Consulting",
      "area": "businessUnit",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "Expected slug=consulting; term lookup=null; available term count=0.",
      "expectedCanonicalState": "A canonical Business Unit term with slug consulting.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create the exact approved term and assign only relevant editorial content; do not derive or rename slugs mechanically.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query siraBusinessUnit by SLUG and its filtered contentNodes connection."
    },
    {
      "site": "Consulting",
      "area": "editorial",
      "classification": "OWNER_DECISION",
      "evidence": "Published accepted-family root count=0; filtered connection unavailable because the exact Business Unit term is missing.",
      "expectedCanonicalState": "An owner-confirmed intentional empty state or an approved editorial publishing plan.",
      "owner": "OWNER_DECISION",
      "recommendedAction": "Decide whether this branch intentionally launches with an empty editorial feed; if not, assign editorial creation to an editor after the Business Unit term exists.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "After the exact term exists, re-query root and branch-filtered accepted editorial connections."
    },
    {
      "site": "Consulting",
      "area": "projects",
      "classification": "OWNER_DECISION",
      "evidence": "Published project count=0.",
      "expectedCanonicalState": "An owner-confirmed intentional empty archive or an approved project publishing plan.",
      "owner": "OWNER_DECISION",
      "recommendedAction": "Decide whether this branch requires launch projects; if yes, commission public project records rather than adding frontend fallbacks.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query siraProjects and native project-single URIs."
    },
    {
      "site": "Healthcare",
      "area": "frontPage",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "showOnFront=posts; pageOnFront=0; page(id: \"/\", idType: URI)=null",
      "expectedCanonicalState": "A published Branch homepage assigned as the static front page and resolving at URI /.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create/select the approved branch homepage and assign it in Reading Settings after editorial approval.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query readingSettings and page(id: \"/\", idType: URI)."
    },
    {
      "site": "Healthcare",
      "area": "primaryMenu",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "Native PRIMARY menu assignment count=0.",
      "expectedCanonicalState": "Exactly one usable native PRIMARY menu assignment.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create/approve and assign the PRIMARY menu using native WordPress menu locations.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
    },
    {
      "site": "Healthcare",
      "area": "footerMenu",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "Native FOOTER menu assignment count=0.",
      "expectedCanonicalState": "Exactly one usable native FOOTER menu assignment.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create/approve and assign the FOOTER menu using native WordPress menu locations.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
    },
    {
      "site": "Healthcare",
      "area": "legalMenu",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "Native LEGAL menu assignment count=0.",
      "expectedCanonicalState": "Exactly one usable native LEGAL menu assignment.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create/approve and assign the LEGAL menu using native WordPress menu locations.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
    },
    {
      "site": "Healthcare",
      "area": "businessUnit",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "Expected slug=healthcare; term lookup=null; available term count=0.",
      "expectedCanonicalState": "A canonical Business Unit term with slug healthcare.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create the exact approved term and assign only relevant editorial content; do not derive or rename slugs mechanically.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query siraBusinessUnit by SLUG and its filtered contentNodes connection."
    },
    {
      "site": "Healthcare",
      "area": "editorial",
      "classification": "OWNER_DECISION",
      "evidence": "Published accepted-family root count=0; filtered connection unavailable because the exact Business Unit term is missing.",
      "expectedCanonicalState": "An owner-confirmed intentional empty state or an approved editorial publishing plan.",
      "owner": "OWNER_DECISION",
      "recommendedAction": "Decide whether this branch intentionally launches with an empty editorial feed; if not, assign editorial creation to an editor after the Business Unit term exists.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "After the exact term exists, re-query root and branch-filtered accepted editorial connections."
    },
    {
      "site": "Healthcare",
      "area": "projects",
      "classification": "OWNER_DECISION",
      "evidence": "Published project count=0.",
      "expectedCanonicalState": "An owner-confirmed intentional empty archive or an approved project publishing plan.",
      "owner": "OWNER_DECISION",
      "recommendedAction": "Decide whether this branch requires launch projects; if yes, commission public project records rather than adding frontend fallbacks.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query siraProjects and native project-single URIs."
    },
    {
      "site": "Healthcare",
      "area": "brand",
      "classification": "DATA_CORRECTION_REQUIRED",
      "evidence": "Live name=SIRA Health; colors={\"primary\":\"#1e73be\",\"secondary\":\"#81d742\",\"accent\":\"#8224e3\",\"paper\":\"#f3f7fb\",\"ink\":\"#1f2932\"}.",
      "expectedCanonicalState": "SIRA Healthcare; primary #2c6dad; secondary #12283f; accent #2c6dad; paper #f3f7fb; ink #1f2932.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Correct the canonical public brand fields in WordPress using the approved repository identity evidence; do not normalize these values in Next.js.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query siraBrand and compare exact effective values."
    },
    {
      "site": "Healthcare",
      "area": "media",
      "classification": "EDITORIAL_ACTION",
      "evidence": "Brand mark alt missing=true.",
      "expectedCanonicalState": "Public required media has useful alt text, safe URLs, and usable dimensions; launch project cards have approved images where required.",
      "owner": "EDITORIAL_ACTION",
      "recommendedAction": "Supply meaningful accessibility text and required project imagery without fabricating assets.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query public media metadata and verify alt/dimensions/source readiness."
    },
    {
      "site": "Lifestyle",
      "area": "frontPage",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "showOnFront=posts; pageOnFront=0; page(id: \"/\", idType: URI)=null",
      "expectedCanonicalState": "A published Branch homepage assigned as the static front page and resolving at URI /.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create/select the approved branch homepage and assign it in Reading Settings after editorial approval.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query readingSettings and page(id: \"/\", idType: URI)."
    },
    {
      "site": "Lifestyle",
      "area": "primaryMenu",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "Native PRIMARY menu assignment count=0.",
      "expectedCanonicalState": "Exactly one usable native PRIMARY menu assignment.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create/approve and assign the PRIMARY menu using native WordPress menu locations.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
    },
    {
      "site": "Lifestyle",
      "area": "footerMenu",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "Native FOOTER menu assignment count=0.",
      "expectedCanonicalState": "Exactly one usable native FOOTER menu assignment.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create/approve and assign the FOOTER menu using native WordPress menu locations.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
    },
    {
      "site": "Lifestyle",
      "area": "legalMenu",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "Native LEGAL menu assignment count=0.",
      "expectedCanonicalState": "Exactly one usable native LEGAL menu assignment.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create/approve and assign the LEGAL menu using native WordPress menu locations.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
    },
    {
      "site": "Lifestyle",
      "area": "businessUnit",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "Expected slug=lifestyle; term lookup=null; available term count=0.",
      "expectedCanonicalState": "A canonical Business Unit term with slug lifestyle.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create the exact approved term and assign only relevant editorial content; do not derive or rename slugs mechanically.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query siraBusinessUnit by SLUG and its filtered contentNodes connection."
    },
    {
      "site": "Lifestyle",
      "area": "editorial",
      "classification": "OWNER_DECISION",
      "evidence": "Published accepted-family root count=0; filtered connection unavailable because the exact Business Unit term is missing.",
      "expectedCanonicalState": "An owner-confirmed intentional empty state or an approved editorial publishing plan.",
      "owner": "OWNER_DECISION",
      "recommendedAction": "Decide whether this branch intentionally launches with an empty editorial feed; if not, assign editorial creation to an editor after the Business Unit term exists.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "After the exact term exists, re-query root and branch-filtered accepted editorial connections."
    },
    {
      "site": "Lifestyle",
      "area": "projects",
      "classification": "OWNER_DECISION",
      "evidence": "Published project count=0.",
      "expectedCanonicalState": "An owner-confirmed intentional empty archive or an approved project publishing plan.",
      "owner": "OWNER_DECISION",
      "recommendedAction": "Decide whether this branch requires launch projects; if yes, commission public project records rather than adding frontend fallbacks.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query siraProjects and native project-single URIs."
    },
    {
      "site": "Real Estate",
      "area": "frontPage",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "showOnFront=posts; pageOnFront=0; page(id: \"/\", idType: URI)=null",
      "expectedCanonicalState": "A published Branch homepage assigned as the static front page and resolving at URI /.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create/select the approved branch homepage and assign it in Reading Settings after editorial approval.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query readingSettings and page(id: \"/\", idType: URI)."
    },
    {
      "site": "Real Estate",
      "area": "primaryMenu",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "Native PRIMARY menu assignment count=0.",
      "expectedCanonicalState": "Exactly one usable native PRIMARY menu assignment.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create/approve and assign the PRIMARY menu using native WordPress menu locations.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
    },
    {
      "site": "Real Estate",
      "area": "footerMenu",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "Native FOOTER menu assignment count=0.",
      "expectedCanonicalState": "Exactly one usable native FOOTER menu assignment.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create/approve and assign the FOOTER menu using native WordPress menu locations.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
    },
    {
      "site": "Real Estate",
      "area": "legalMenu",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "Native LEGAL menu assignment count=0.",
      "expectedCanonicalState": "Exactly one usable native LEGAL menu assignment.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create/approve and assign the LEGAL menu using native WordPress menu locations.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query the accepted SiraNavigation operation and validate hierarchy/URLs."
    },
    {
      "site": "Real Estate",
      "area": "businessUnit",
      "classification": "MISSING_CONFIGURATION",
      "evidence": "Expected slug=real-estate; term lookup=null; available term count=0.",
      "expectedCanonicalState": "A canonical Business Unit term with slug real-estate.",
      "owner": "CMS_ADMIN_ACTION",
      "recommendedAction": "Create the exact approved term and assign only relevant editorial content; do not derive or rename slugs mechanically.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query siraBusinessUnit by SLUG and its filtered contentNodes connection."
    },
    {
      "site": "Real Estate",
      "area": "editorial",
      "classification": "OWNER_DECISION",
      "evidence": "Published accepted-family root count=0; filtered connection unavailable because the exact Business Unit term is missing.",
      "expectedCanonicalState": "An owner-confirmed intentional empty state or an approved editorial publishing plan.",
      "owner": "OWNER_DECISION",
      "recommendedAction": "Decide whether this branch intentionally launches with an empty editorial feed; if not, assign editorial creation to an editor after the Business Unit term exists.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "After the exact term exists, re-query root and branch-filtered accepted editorial connections."
    },
    {
      "site": "Real Estate",
      "area": "projects",
      "classification": "OWNER_DECISION",
      "evidence": "Published project count=0.",
      "expectedCanonicalState": "An owner-confirmed intentional empty archive or an approved project publishing plan.",
      "owner": "OWNER_DECISION",
      "recommendedAction": "Decide whether this branch requires launch projects; if yes, commission public project records rather than adding frontend fallbacks.",
      "destructive": false,
      "mutationAuthorized": false,
      "verificationMethod": "Re-query siraProjects and native project-single URIs."
    }
  ],
  "historicalRevalidation": {
    "branchFrontPages": "UNCHANGED_MISSING",
    "nativeMenus": "UNCHANGED_MISSING",
    "groupBrand": "UNCORRECTED",
    "healthcareBrand": "UNCORRECTED"
  },
  "sites": {
    "group": {
      "siteName": "Group",
      "inspected": true,
      "homepage": {
        "showOnFront": "page",
        "pageOnFront": 457,
        "resolvesRootUri": true,
        "databaseId": 457,
        "uri": "/",
        "title": "Home",
        "status": "publish",
        "isFrontPage": true,
        "variant": "group",
        "expectedVariant": "group",
        "heroFieldPopulation": {
          "headingBefore": false,
          "headingHighlight": false,
          "headingAfter": false,
          "description": false
        }
      },
      "menus": {
        "primary": {
          "assignedCount": 0,
          "truncated": false,
          "menus": []
        },
        "footer": {
          "assignedCount": 0,
          "truncated": false,
          "menus": []
        },
        "legal": {
          "assignedCount": 0,
          "truncated": false,
          "menus": []
        }
      },
      "businessUnit": {
        "expectedSlug": null,
        "term": null,
        "availableTerms": [
          {
            "databaseId": 60,
            "name": "Consulting",
            "slug": "consulting",
            "totalAssignedObjectCount": 1,
            "acceptedEditorialAssignments": {
              "returnedCount": 1,
              "truncated": false,
              "byType": {
                "SiraNewsItem": 1,
                "SiraInsight": 0,
                "SiraArticle": 0,
                "SiraPressRelease": 0
              },
              "missingTitleCount": 0,
              "unsafeUriCount": 0,
              "missingDateCount": 0,
              "missingExcerptCount": 0,
              "restrictedCount": 0,
              "featuredMedia": {
                "populatedCount": 0,
                "missingAltCount": 0,
                "unsafeUrlCount": 0,
                "invalidDimensionsCount": 0
              }
            }
          },
          {
            "databaseId": 62,
            "name": "Healthcare",
            "slug": "healthcare",
            "totalAssignedObjectCount": 1,
            "acceptedEditorialAssignments": {
              "returnedCount": 1,
              "truncated": false,
              "byType": {
                "SiraNewsItem": 1,
                "SiraInsight": 0,
                "SiraArticle": 0,
                "SiraPressRelease": 0
              },
              "missingTitleCount": 0,
              "unsafeUriCount": 0,
              "missingDateCount": 0,
              "missingExcerptCount": 0,
              "restrictedCount": 0,
              "featuredMedia": {
                "populatedCount": 0,
                "missingAltCount": 0,
                "unsafeUrlCount": 0,
                "invalidDimensionsCount": 0
              }
            }
          },
          {
            "databaseId": 61,
            "name": "Lifestyle",
            "slug": "lifestyle",
            "totalAssignedObjectCount": 1,
            "acceptedEditorialAssignments": {
              "returnedCount": 1,
              "truncated": false,
              "byType": {
                "SiraNewsItem": 1,
                "SiraInsight": 0,
                "SiraArticle": 0,
                "SiraPressRelease": 0
              },
              "missingTitleCount": 0,
              "unsafeUriCount": 0,
              "missingDateCount": 0,
              "missingExcerptCount": 0,
              "restrictedCount": 0,
              "featuredMedia": {
                "populatedCount": 0,
                "missingAltCount": 0,
                "unsafeUrlCount": 0,
                "invalidDimensionsCount": 0
              }
            }
          },
          {
            "databaseId": 59,
            "name": "Real Estate",
            "slug": "real-estate",
            "totalAssignedObjectCount": 1,
            "acceptedEditorialAssignments": {
              "returnedCount": 1,
              "truncated": false,
              "byType": {
                "SiraNewsItem": 1,
                "SiraInsight": 0,
                "SiraArticle": 0,
                "SiraPressRelease": 0
              },
              "missingTitleCount": 0,
              "unsafeUriCount": 0,
              "missingDateCount": 0,
              "missingExcerptCount": 0,
              "restrictedCount": 0,
              "featuredMedia": {
                "populatedCount": 0,
                "missingAltCount": 0,
                "unsafeUrlCount": 0,
                "invalidDimensionsCount": 0
              }
            }
          }
        ],
        "availableTermsTruncated": false
      },
      "editorial": {
        "groupRootUnfiltered": true,
        "root": {
          "returnedCount": 4,
          "truncated": false,
          "byType": {
            "SiraNewsItem": 4,
            "SiraInsight": 0,
            "SiraArticle": 0,
            "SiraPressRelease": 0
          },
          "missingTitleCount": 0,
          "unsafeUriCount": 0,
          "missingDateCount": 0,
          "missingExcerptCount": 0,
          "restrictedCount": 0,
          "featuredMedia": {
            "populatedCount": 0,
            "missingAltCount": 0,
            "unsafeUrlCount": 0,
            "invalidDimensionsCount": 0
          }
        },
        "branchFiltered": null
      },
      "projects": {
        "returnedPublishedCount": 3,
        "truncated": false,
        "restrictedCount": 0,
        "missingTitleCount": 0,
        "unsafeUriCount": 0,
        "missingExcerptCount": 0,
        "missingFeaturedImageCount": 3,
        "missingFeaturedAltCount": 0,
        "missingSubtitleCount": 3,
        "missingLocationCount": 0,
        "missingStatusCount": 0,
        "missingRenderedContentCount": 0,
        "gallery": {
          "populatedProjectCount": 0,
          "truncatedProjectCount": 0,
          "unsafeMediaCount": 0,
          "missingAltCount": 0,
          "restrictedMediaCount": 0
        },
        "statistics": {
          "populatedProjectCount": 0,
          "malformedEntryCount": 0
        },
        "relatedCompanies": {
          "populatedProjectCount": 3,
          "truncatedProjectCount": 0,
          "restrictedCount": 0,
          "malformedCount": 0
        }
      },
      "brand": {
        "key": "group",
        "name": "SIRA Global Logo",
        "tagline": "Shaping a smarter future.",
        "colors": {
          "primary": "#cccccc",
          "secondary": "#5b5b5b",
          "accent": "#cca34b",
          "paper": "#f7f4ed",
          "ink": "#20242b"
        },
        "logo": {
          "populated": true,
          "databaseId": 459,
          "safeSourceUrl": true,
          "hasAltText": false,
          "width": 1626,
          "height": 613,
          "restricted": false
        },
        "mark": {
          "populated": false
        },
        "publicIdentityPresence": {
          "email": false,
          "phone": false,
          "address": false,
          "description": false,
          "mission": false,
          "vision": false
        },
        "announcement": {
          "state": "null"
        },
        "emergency": {
          "state": "null"
        }
      }
    },
    "consulting": {
      "siteName": "Consulting",
      "inspected": true,
      "homepage": {
        "showOnFront": "posts",
        "pageOnFront": 0,
        "resolvesRootUri": false,
        "databaseId": null,
        "uri": null,
        "title": null,
        "status": null,
        "isFrontPage": false,
        "variant": null,
        "expectedVariant": "branch",
        "heroFieldPopulation": null
      },
      "menus": {
        "primary": {
          "assignedCount": 0,
          "truncated": false,
          "menus": []
        },
        "footer": {
          "assignedCount": 0,
          "truncated": false,
          "menus": []
        },
        "legal": {
          "assignedCount": 0,
          "truncated": false,
          "menus": []
        }
      },
      "businessUnit": {
        "expectedSlug": "consulting",
        "term": null,
        "availableTerms": [],
        "availableTermsTruncated": false
      },
      "editorial": {
        "groupRootUnfiltered": false,
        "root": {
          "returnedCount": 0,
          "truncated": false,
          "byType": {
            "SiraNewsItem": 0,
            "SiraInsight": 0,
            "SiraArticle": 0,
            "SiraPressRelease": 0
          },
          "missingTitleCount": 0,
          "unsafeUriCount": 0,
          "missingDateCount": 0,
          "missingExcerptCount": 0,
          "restrictedCount": 0,
          "featuredMedia": {
            "populatedCount": 0,
            "missingAltCount": 0,
            "unsafeUrlCount": 0,
            "invalidDimensionsCount": 0
          }
        },
        "branchFiltered": null
      },
      "projects": {
        "returnedPublishedCount": 0,
        "truncated": false,
        "restrictedCount": 0,
        "missingTitleCount": 0,
        "unsafeUriCount": 0,
        "missingExcerptCount": 0,
        "missingFeaturedImageCount": 0,
        "missingFeaturedAltCount": 0,
        "missingSubtitleCount": 0,
        "missingLocationCount": 0,
        "missingStatusCount": 0,
        "missingRenderedContentCount": 0,
        "gallery": {
          "populatedProjectCount": 0,
          "truncatedProjectCount": 0,
          "unsafeMediaCount": 0,
          "missingAltCount": 0,
          "restrictedMediaCount": 0
        },
        "statistics": {
          "populatedProjectCount": 0,
          "malformedEntryCount": 0
        },
        "relatedCompanies": {
          "populatedProjectCount": 0,
          "truncatedProjectCount": 0,
          "restrictedCount": 0,
          "malformedCount": 0
        }
      },
      "brand": {
        "key": "consulting",
        "name": "SIRA Consulting",
        "tagline": "Strategy for new markets.",
        "colors": {
          "primary": "#8b5aae",
          "secondary": "#2b1f36",
          "accent": "#8b5aae",
          "paper": "#f8f4fa",
          "ink": "#29232d"
        },
        "logo": {
          "populated": false
        },
        "mark": {
          "populated": false
        },
        "publicIdentityPresence": {
          "email": false,
          "phone": false,
          "address": false,
          "description": false,
          "mission": false,
          "vision": false
        },
        "announcement": {
          "state": "null"
        },
        "emergency": {
          "state": "null"
        }
      }
    },
    "healthcare": {
      "siteName": "Healthcare",
      "inspected": true,
      "homepage": {
        "showOnFront": "posts",
        "pageOnFront": 0,
        "resolvesRootUri": false,
        "databaseId": null,
        "uri": null,
        "title": null,
        "status": null,
        "isFrontPage": false,
        "variant": null,
        "expectedVariant": "branch",
        "heroFieldPopulation": null
      },
      "menus": {
        "primary": {
          "assignedCount": 0,
          "truncated": false,
          "menus": []
        },
        "footer": {
          "assignedCount": 0,
          "truncated": false,
          "menus": []
        },
        "legal": {
          "assignedCount": 0,
          "truncated": false,
          "menus": []
        }
      },
      "businessUnit": {
        "expectedSlug": "healthcare",
        "term": null,
        "availableTerms": [],
        "availableTermsTruncated": false
      },
      "editorial": {
        "groupRootUnfiltered": false,
        "root": {
          "returnedCount": 0,
          "truncated": false,
          "byType": {
            "SiraNewsItem": 0,
            "SiraInsight": 0,
            "SiraArticle": 0,
            "SiraPressRelease": 0
          },
          "missingTitleCount": 0,
          "unsafeUriCount": 0,
          "missingDateCount": 0,
          "missingExcerptCount": 0,
          "restrictedCount": 0,
          "featuredMedia": {
            "populatedCount": 0,
            "missingAltCount": 0,
            "unsafeUrlCount": 0,
            "invalidDimensionsCount": 0
          }
        },
        "branchFiltered": null
      },
      "projects": {
        "returnedPublishedCount": 0,
        "truncated": false,
        "restrictedCount": 0,
        "missingTitleCount": 0,
        "unsafeUriCount": 0,
        "missingExcerptCount": 0,
        "missingFeaturedImageCount": 0,
        "missingFeaturedAltCount": 0,
        "missingSubtitleCount": 0,
        "missingLocationCount": 0,
        "missingStatusCount": 0,
        "missingRenderedContentCount": 0,
        "gallery": {
          "populatedProjectCount": 0,
          "truncatedProjectCount": 0,
          "unsafeMediaCount": 0,
          "missingAltCount": 0,
          "restrictedMediaCount": 0
        },
        "statistics": {
          "populatedProjectCount": 0,
          "malformedEntryCount": 0
        },
        "relatedCompanies": {
          "populatedProjectCount": 0,
          "truncatedProjectCount": 0,
          "restrictedCount": 0,
          "malformedCount": 0
        }
      },
      "brand": {
        "key": "healthcare",
        "name": "SIRA Health",
        "tagline": "Advancing diagnostic and healthcare infrastructure.",
        "colors": {
          "primary": "#1e73be",
          "secondary": "#81d742",
          "accent": "#8224e3",
          "paper": "#f3f7fb",
          "ink": "#1f2932"
        },
        "logo": {
          "populated": true,
          "databaseId": 15,
          "safeSourceUrl": true,
          "hasAltText": true,
          "width": 768,
          "height": 290,
          "restricted": false
        },
        "mark": {
          "populated": true,
          "databaseId": 16,
          "safeSourceUrl": true,
          "hasAltText": false,
          "width": 285,
          "height": 274,
          "restricted": false
        },
        "publicIdentityPresence": {
          "email": true,
          "phone": true,
          "address": true,
          "description": true,
          "mission": true,
          "vision": true
        },
        "announcement": {
          "state": "populated",
          "messagePresent": true,
          "severity": "INFO",
          "linkPresent": true,
          "linkSafe": true,
          "target": null,
          "startsAt": null,
          "endsAt": null,
          "dismissible": false,
          "revisionKeyPresent": true,
          "schedule": "active"
        },
        "emergency": {
          "state": "null"
        }
      }
    },
    "lifestyle": {
      "siteName": "Lifestyle",
      "inspected": true,
      "homepage": {
        "showOnFront": "posts",
        "pageOnFront": 0,
        "resolvesRootUri": false,
        "databaseId": null,
        "uri": null,
        "title": null,
        "status": null,
        "isFrontPage": false,
        "variant": null,
        "expectedVariant": "branch",
        "heroFieldPopulation": null
      },
      "menus": {
        "primary": {
          "assignedCount": 0,
          "truncated": false,
          "menus": []
        },
        "footer": {
          "assignedCount": 0,
          "truncated": false,
          "menus": []
        },
        "legal": {
          "assignedCount": 0,
          "truncated": false,
          "menus": []
        }
      },
      "businessUnit": {
        "expectedSlug": "lifestyle",
        "term": null,
        "availableTerms": [],
        "availableTermsTruncated": false
      },
      "editorial": {
        "groupRootUnfiltered": false,
        "root": {
          "returnedCount": 0,
          "truncated": false,
          "byType": {
            "SiraNewsItem": 0,
            "SiraInsight": 0,
            "SiraArticle": 0,
            "SiraPressRelease": 0
          },
          "missingTitleCount": 0,
          "unsafeUriCount": 0,
          "missingDateCount": 0,
          "missingExcerptCount": 0,
          "restrictedCount": 0,
          "featuredMedia": {
            "populatedCount": 0,
            "missingAltCount": 0,
            "unsafeUrlCount": 0,
            "invalidDimensionsCount": 0
          }
        },
        "branchFiltered": null
      },
      "projects": {
        "returnedPublishedCount": 0,
        "truncated": false,
        "restrictedCount": 0,
        "missingTitleCount": 0,
        "unsafeUriCount": 0,
        "missingExcerptCount": 0,
        "missingFeaturedImageCount": 0,
        "missingFeaturedAltCount": 0,
        "missingSubtitleCount": 0,
        "missingLocationCount": 0,
        "missingStatusCount": 0,
        "missingRenderedContentCount": 0,
        "gallery": {
          "populatedProjectCount": 0,
          "truncatedProjectCount": 0,
          "unsafeMediaCount": 0,
          "missingAltCount": 0,
          "restrictedMediaCount": 0
        },
        "statistics": {
          "populatedProjectCount": 0,
          "malformedEntryCount": 0
        },
        "relatedCompanies": {
          "populatedProjectCount": 0,
          "truncatedProjectCount": 0,
          "restrictedCount": 0,
          "malformedCount": 0
        }
      },
      "brand": {
        "key": "lifestyle",
        "name": "SIRA Lifestyle",
        "tagline": "Creating destination-led hospitality and lifestyle experiences.",
        "colors": {
          "primary": "#2e8c72",
          "secondary": "#12382f",
          "accent": "#2e8c72",
          "paper": "#f2f8f5",
          "ink": "#1f2b27"
        },
        "logo": {
          "populated": false
        },
        "mark": {
          "populated": false
        },
        "publicIdentityPresence": {
          "email": false,
          "phone": false,
          "address": false,
          "description": false,
          "mission": false,
          "vision": false
        },
        "announcement": {
          "state": "null"
        },
        "emergency": {
          "state": "null"
        }
      }
    },
    "realestate": {
      "siteName": "Real Estate",
      "inspected": true,
      "homepage": {
        "showOnFront": "posts",
        "pageOnFront": 0,
        "resolvesRootUri": false,
        "databaseId": null,
        "uri": null,
        "title": null,
        "status": null,
        "isFrontPage": false,
        "variant": null,
        "expectedVariant": "branch",
        "heroFieldPopulation": null
      },
      "menus": {
        "primary": {
          "assignedCount": 0,
          "truncated": false,
          "menus": []
        },
        "footer": {
          "assignedCount": 0,
          "truncated": false,
          "menus": []
        },
        "legal": {
          "assignedCount": 0,
          "truncated": false,
          "menus": []
        }
      },
      "businessUnit": {
        "expectedSlug": "real-estate",
        "term": null,
        "availableTerms": [],
        "availableTermsTruncated": false
      },
      "editorial": {
        "groupRootUnfiltered": false,
        "root": {
          "returnedCount": 0,
          "truncated": false,
          "byType": {
            "SiraNewsItem": 0,
            "SiraInsight": 0,
            "SiraArticle": 0,
            "SiraPressRelease": 0
          },
          "missingTitleCount": 0,
          "unsafeUriCount": 0,
          "missingDateCount": 0,
          "missingExcerptCount": 0,
          "restrictedCount": 0,
          "featuredMedia": {
            "populatedCount": 0,
            "missingAltCount": 0,
            "unsafeUrlCount": 0,
            "invalidDimensionsCount": 0
          }
        },
        "branchFiltered": null
      },
      "projects": {
        "returnedPublishedCount": 0,
        "truncated": false,
        "restrictedCount": 0,
        "missingTitleCount": 0,
        "unsafeUriCount": 0,
        "missingExcerptCount": 0,
        "missingFeaturedImageCount": 0,
        "missingFeaturedAltCount": 0,
        "missingSubtitleCount": 0,
        "missingLocationCount": 0,
        "missingStatusCount": 0,
        "missingRenderedContentCount": 0,
        "gallery": {
          "populatedProjectCount": 0,
          "truncatedProjectCount": 0,
          "unsafeMediaCount": 0,
          "missingAltCount": 0,
          "restrictedMediaCount": 0
        },
        "statistics": {
          "populatedProjectCount": 0,
          "malformedEntryCount": 0
        },
        "relatedCompanies": {
          "populatedProjectCount": 0,
          "truncatedProjectCount": 0,
          "restrictedCount": 0,
          "malformedCount": 0
        }
      },
      "brand": {
        "key": "realestate",
        "name": "SIRA Real Estate",
        "tagline": "Building enduring places across markets.",
        "colors": {
          "primary": "#b0733c",
          "secondary": "#2b1b14",
          "accent": "#b0733c",
          "paper": "#faf5ef",
          "ink": "#25201d"
        },
        "logo": {
          "populated": false
        },
        "mark": {
          "populated": false
        },
        "publicIdentityPresence": {
          "email": false,
          "phone": false,
          "address": false,
          "description": false,
          "mission": false,
          "vision": false
        },
        "announcement": {
          "state": "null"
        },
        "emergency": {
          "state": "null"
        }
      }
    }
  }
}
```

### frontend/scripts/content-readiness-audit.mjs

```javascript
import { readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import process from "node:process";

const SITE_CONFIG = Object.freeze({
  group: Object.freeze({
    name: "Group",
    endpointKey: "SIRA_WP_GROUP_GRAPHQL_URL",
    businessUnit: null,
  }),
  consulting: Object.freeze({
    name: "Consulting",
    endpointKey: "SIRA_WP_CONSULTING_GRAPHQL_URL",
    businessUnit: "consulting",
  }),
  healthcare: Object.freeze({
    name: "Healthcare",
    endpointKey: "SIRA_WP_HEALTHCARE_GRAPHQL_URL",
    businessUnit: "healthcare",
  }),
  lifestyle: Object.freeze({
    name: "Lifestyle",
    endpointKey: "SIRA_WP_LIFESTYLE_GRAPHQL_URL",
    businessUnit: "lifestyle",
  }),
  realestate: Object.freeze({
    name: "Real Estate",
    endpointKey: "SIRA_WP_REALESTATE_GRAPHQL_URL",
    businessUnit: "real-estate",
  }),
});

const ACCEPTED_EDITORIAL_TYPES = Object.freeze([
  "SiraNewsItem",
  "SiraInsight",
  "SiraArticle",
  "SiraPressRelease",
]);

const MATRIX_AREAS = Object.freeze([
  "frontPage",
  "primaryMenu",
  "footerMenu",
  "legalMenu",
  "businessUnit",
  "editorial",
  "projects",
  "brand",
  "announcement",
  "emergency",
  "media",
]);

const READINESS_CLASSIFICATIONS = Object.freeze([
  "READY",
  "MISSING_CONTENT",
  "MISSING_CONFIGURATION",
  "DATA_CORRECTION_REQUIRED",
  "EDITORIAL_ACTION",
  "OWNER_DECISION",
  "BLOCKED",
]);

const QUERY = String.raw`
  query SiraContentReadinessAudit($businessUnit: ID!) {
    readingSettings {
      showOnFront
      pageOnFront
    }
    frontPage: page(id: "/", idType: URI, asPreview: false) {
      databaseId
      uri
      title
      status
      isFrontPage
      siraHomepage {
        variant
        groupHomepage {
          hero {
            headingBefore
            headingHighlight
            headingAfter
            description
          }
        }
        branchHomepage {
          hero {
            eyebrow
            headingBefore
            headingHighlight
            headingAfter
            description
            region
          }
        }
      }
    }
    primary: menus(first: 2, where: { location: PRIMARY }) {
      pageInfo { hasNextPage }
      nodes {
        databaseId
        name
        slug
        isRestricted
        locations
        menuItems(first: 200) {
          pageInfo { hasNextPage }
          nodes {
            databaseId
            isRestricted
            label
            order
            parentDatabaseId
            target
            url
          }
        }
      }
    }
    footer: menus(first: 2, where: { location: FOOTER }) {
      pageInfo { hasNextPage }
      nodes {
        databaseId
        name
        slug
        isRestricted
        locations
        menuItems(first: 200) {
          pageInfo { hasNextPage }
          nodes {
            databaseId
            isRestricted
            label
            order
            parentDatabaseId
            target
            url
          }
        }
      }
    }
    legal: menus(first: 2, where: { location: LEGAL }) {
      pageInfo { hasNextPage }
      nodes {
        databaseId
        name
        slug
        isRestricted
        locations
        menuItems(first: 200) {
          pageInfo { hasNextPage }
          nodes {
            databaseId
            isRestricted
            label
            order
            parentDatabaseId
            target
            url
          }
        }
      }
    }
    businessUnits: siraBusinessUnits(first: 100, where: { hideEmpty: false }) {
      pageInfo { hasNextPage }
      nodes {
        databaseId
        name
        slug
        count
        acceptedEditorial: contentNodes(
          first: 100
          where: {
            contentTypes: [SIRA_NEWS, SIRA_INSIGHT, SIRA_ARTICLE, SIRA_PRESS_RELEASE]
            orderby: [{ field: DATE, order: DESC }]
          }
        ) {
          pageInfo { hasNextPage }
          nodes { ...SiraEditorialAuditNode }
        }
      }
    }
    branchBusinessUnit: siraBusinessUnit(id: $businessUnit, idType: SLUG) {
      databaseId
      name
      slug
      count
      contentNodes(
        first: 100
        where: {
          contentTypes: [SIRA_NEWS, SIRA_INSIGHT, SIRA_ARTICLE, SIRA_PRESS_RELEASE]
          orderby: [{ field: DATE, order: DESC }]
        }
      ) {
        pageInfo { hasNextPage }
        nodes { ...SiraEditorialAuditNode }
      }
    }
    editorial: contentNodes(
      first: 100
      where: {
        contentTypes: [SIRA_NEWS, SIRA_INSIGHT, SIRA_ARTICLE, SIRA_PRESS_RELEASE]
        orderby: [{ field: DATE, order: DESC }]
      }
    ) {
      pageInfo { hasNextPage }
      nodes { ...SiraEditorialAuditNode }
    }
    projects: siraProjects(first: 100) {
      pageInfo { hasNextPage }
      nodes {
        databaseId
        title
        uri
        excerpt
        content(format: RENDERED)
        status
        isRestricted
        featuredImage {
          node {
            databaseId
            sourceUrl
            altText
            isRestricted
            mediaDetails { width height }
          }
        }
        projectDetails {
          subtitle
          location
          status
          gallery(first: 50) {
            pageInfo { hasNextPage }
            nodes {
              databaseId
              sourceUrl
              altText
              isRestricted
              mediaDetails { width height }
            }
          }
          statistics { label value }
          relatedCompany(first: 10) {
            pageInfo { hasNextPage }
            nodes {
              __typename
              databaseId
              isRestricted
              ... on SiraCompany { title uri }
            }
          }
        }
      }
    }
    brand: siraBrand {
      key
      name
      tagline
      primaryColor
      secondaryColor
      accentColor
      paperColor
      inkColor
      logo { databaseId sourceUrl altText width height }
      mark { databaseId sourceUrl altText width height }
      email
      phone
      address
      description
      mission
      vision
      announcement {
        message
        severity
        link { label url target }
        startsAt
        endsAt
        dismissible
        revisionKey
      }
      emergency {
        message
        severity
        link { label url target }
        startsAt
        endsAt
        dismissible
        revisionKey
      }
    }
  }

  fragment SiraEditorialAuditNode on ContentNode {
    __typename
    databaseId
    contentTypeName
    date
    uri
    isRestricted
    ... on SiraNewsItem {
      title
      excerpt
      featuredImage { node { databaseId sourceUrl altText mediaDetails { width height } } }
    }
    ... on SiraInsight {
      title
      excerpt
      featuredImage { node { databaseId sourceUrl altText mediaDetails { width height } } }
    }
    ... on SiraArticle {
      title
      excerpt
      featuredImage { node { databaseId sourceUrl altText mediaDetails { width height } } }
    }
    ... on SiraPressRelease {
      title
      excerpt
      featuredImage { node { databaseId sourceUrl altText mediaDetails { width height } } }
    }
  }
`;

function isNonEmpty(value) {
  return typeof value === "string" && value.trim() !== "";
}

function isSafeUrl(value) {
  if (!isNonEmpty(value) || /[\u0000-\u001f\u007f]/u.test(value)) return false;
  if (value.startsWith("/")) return !value.startsWith("//");
  try {
    const parsed = new URL(value);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      parsed.username === "" &&
      parsed.password === ""
    );
  } catch {
    return false;
  }
}

function mediaSummary(media) {
  if (!media) return { populated: false };
  const dimensions = media.mediaDetails ?? media;
  return {
    populated: true,
    databaseId: media.databaseId,
    safeSourceUrl: isSafeUrl(media.sourceUrl),
    hasAltText: isNonEmpty(media.altText),
    width: dimensions.width ?? null,
    height: dimensions.height ?? null,
    restricted: media.isRestricted === true,
  };
}

function menuSummary(connection) {
  const menus = connection?.nodes ?? [];
  return {
    assignedCount: menus.length,
    truncated: connection?.pageInfo?.hasNextPage === true,
    menus: menus.map((menu) => {
      const items = menu.menuItems?.nodes ?? [];
      const ids = new Set(items.map((item) => item.databaseId));
      return {
        databaseId: menu.databaseId,
        name: menu.name,
        slug: menu.slug,
        restricted: menu.isRestricted === true,
        locations: menu.locations ?? [],
        itemCount: items.length,
        truncated: menu.menuItems?.pageInfo?.hasNextPage === true,
        unsafeUrlCount: items.filter((item) => !isSafeUrl(item.url)).length,
        restrictedItemCount: items.filter((item) => item.isRestricted === true).length,
        duplicateIdentityCount: items.length - ids.size,
        orphanCount: items.filter(
          (item) => item.parentDatabaseId && !ids.has(item.parentDatabaseId),
        ).length,
      };
    }),
  };
}

function editorialSummary(connection) {
  const nodes = connection?.nodes ?? [];
  const byType = Object.fromEntries(ACCEPTED_EDITORIAL_TYPES.map((type) => [type, 0]));
  for (const node of nodes) {
    if (Object.hasOwn(byType, node.__typename)) byType[node.__typename] += 1;
  }
  return {
    returnedCount: nodes.length,
    truncated: connection?.pageInfo?.hasNextPage === true,
    byType,
    missingTitleCount: nodes.filter((node) => !isNonEmpty(node.title)).length,
    unsafeUriCount: nodes.filter((node) => !isSafeUrl(node.uri)).length,
    missingDateCount: nodes.filter((node) => !isNonEmpty(node.date)).length,
    missingExcerptCount: nodes.filter((node) => !isNonEmpty(node.excerpt)).length,
    restrictedCount: nodes.filter((node) => node.isRestricted === true).length,
    featuredMedia: {
      populatedCount: nodes.filter((node) => node.featuredImage?.node).length,
      missingAltCount: nodes.filter(
        (node) => node.featuredImage?.node && !isNonEmpty(node.featuredImage.node.altText),
      ).length,
      unsafeUrlCount: nodes.filter(
        (node) => node.featuredImage?.node && !isSafeUrl(node.featuredImage.node.sourceUrl),
      ).length,
      invalidDimensionsCount: nodes.filter((node) => {
        const media = node.featuredImage?.node;
        return media && (!(media.mediaDetails?.width > 0) || !(media.mediaDetails?.height > 0));
      }).length,
    },
  };
}

function projectSummary(connection) {
  const nodes = connection?.nodes ?? [];
  return {
    returnedPublishedCount: nodes.length,
    truncated: connection?.pageInfo?.hasNextPage === true,
    restrictedCount: nodes.filter((node) => node.isRestricted === true).length,
    missingTitleCount: nodes.filter((node) => !isNonEmpty(node.title)).length,
    unsafeUriCount: nodes.filter((node) => !isSafeUrl(node.uri)).length,
    missingExcerptCount: nodes.filter((node) => !isNonEmpty(node.excerpt)).length,
    missingFeaturedImageCount: nodes.filter((node) => !node.featuredImage?.node).length,
    missingFeaturedAltCount: nodes.filter(
      (node) => node.featuredImage?.node && !isNonEmpty(node.featuredImage.node.altText),
    ).length,
    missingSubtitleCount: nodes.filter((node) => !isNonEmpty(node.projectDetails?.subtitle)).length,
    missingLocationCount: nodes.filter((node) => !isNonEmpty(node.projectDetails?.location)).length,
    missingStatusCount: nodes.filter((node) => !isNonEmpty(node.projectDetails?.status)).length,
    missingRenderedContentCount: nodes.filter((node) => !isNonEmpty(node.content)).length,
    gallery: {
      populatedProjectCount: nodes.filter((node) => (node.projectDetails?.gallery?.nodes?.length ?? 0) > 0).length,
      truncatedProjectCount: nodes.filter((node) => node.projectDetails?.gallery?.pageInfo?.hasNextPage === true).length,
      unsafeMediaCount: nodes.flatMap((node) => node.projectDetails?.gallery?.nodes ?? []).filter((media) => !isSafeUrl(media.sourceUrl)).length,
      missingAltCount: nodes.flatMap((node) => node.projectDetails?.gallery?.nodes ?? []).filter((media) => !isNonEmpty(media.altText)).length,
      restrictedMediaCount: nodes.flatMap((node) => node.projectDetails?.gallery?.nodes ?? []).filter((media) => media.isRestricted === true).length,
    },
    statistics: {
      populatedProjectCount: nodes.filter((node) => (node.projectDetails?.statistics?.length ?? 0) > 0).length,
      malformedEntryCount: nodes.flatMap((node) => node.projectDetails?.statistics ?? []).filter((stat) => !isNonEmpty(stat.label) || !isNonEmpty(stat.value)).length,
    },
    relatedCompanies: {
      populatedProjectCount: nodes.filter((node) => (node.projectDetails?.relatedCompany?.nodes?.length ?? 0) > 0).length,
      truncatedProjectCount: nodes.filter((node) => node.projectDetails?.relatedCompany?.pageInfo?.hasNextPage === true).length,
      restrictedCount: nodes.flatMap((node) => node.projectDetails?.relatedCompany?.nodes ?? []).filter((company) => company.isRestricted === true).length,
      malformedCount: nodes.flatMap((node) => node.projectDetails?.relatedCompany?.nodes ?? []).filter((company) => !(company.databaseId > 0) || !isNonEmpty(company.title) || !isSafeUrl(company.uri)).length,
    },
  };
}

function bannerSummary(banner, auditedAt) {
  if (!banner) return { state: "null" };
  const startsAt = banner.startsAt ? Date.parse(banner.startsAt) : null;
  const endsAt = banner.endsAt ? Date.parse(banner.endsAt) : null;
  const at = Date.parse(auditedAt);
  const validDates = (startsAt === null || Number.isFinite(startsAt)) && (endsAt === null || Number.isFinite(endsAt));
  let schedule = "active";
  if (!validDates) schedule = "malformed";
  else if (startsAt !== null && at < startsAt) schedule = "scheduled";
  else if (endsAt !== null && at > endsAt) schedule = "expired";
  return {
    state: "populated",
    messagePresent: isNonEmpty(banner.message),
    severity: banner.severity,
    linkPresent: banner.link !== null,
    linkSafe: banner.link ? isSafeUrl(banner.link.url) : null,
    target: banner.link?.target ?? null,
    startsAt: banner.startsAt,
    endsAt: banner.endsAt,
    dismissible: banner.dismissible,
    revisionKeyPresent: isNonEmpty(banner.revisionKey),
    schedule,
  };
}

function brandSummary(brand, auditedAt) {
  return {
    key: brand?.key ?? null,
    name: brand?.name ?? null,
    tagline: brand?.tagline ?? null,
    colors: {
      primary: brand?.primaryColor ?? null,
      secondary: brand?.secondaryColor ?? null,
      accent: brand?.accentColor ?? null,
      paper: brand?.paperColor ?? null,
      ink: brand?.inkColor ?? null,
    },
    logo: mediaSummary(brand?.logo),
    mark: mediaSummary(brand?.mark),
    publicIdentityPresence: {
      email: isNonEmpty(brand?.email),
      phone: isNonEmpty(brand?.phone),
      address: isNonEmpty(brand?.address),
      description: isNonEmpty(brand?.description),
      mission: isNonEmpty(brand?.mission),
      vision: isNonEmpty(brand?.vision),
    },
    announcement: bannerSummary(brand?.announcement, auditedAt),
    emergency: bannerSummary(brand?.emergency, auditedAt),
  };
}

function homepageSummary(data, siteKey) {
  const page = data.frontPage;
  const expectedVariant = siteKey === "group" ? "group" : "branch";
  const hero = expectedVariant === "group" ? page?.siraHomepage?.groupHomepage?.hero : page?.siraHomepage?.branchHomepage?.hero;
  return {
    showOnFront: data.readingSettings?.showOnFront ?? null,
    pageOnFront: data.readingSettings?.pageOnFront ?? null,
    resolvesRootUri: page !== null,
    databaseId: page?.databaseId ?? null,
    uri: page?.uri ?? null,
    title: page?.title ?? null,
    status: page?.status ?? null,
    isFrontPage: page?.isFrontPage ?? false,
    variant: page?.siraHomepage?.variant ?? null,
    expectedVariant,
    heroFieldPopulation: hero
      ? Object.fromEntries(Object.entries(hero).map(([key, value]) => [key, isNonEmpty(value)]))
      : null,
  };
}

function classifySite(siteKey, site) {
  if (!site.inspected) {
    return Object.fromEntries(MATRIX_AREAS.map((area) => [area, "BLOCKED"]));
  }
  const branch = siteKey !== "group";
  return {
    frontPage: branch ? "MISSING_CONFIGURATION" : "MISSING_CONTENT",
    primaryMenu: "MISSING_CONFIGURATION",
    footerMenu: "MISSING_CONFIGURATION",
    legalMenu: "MISSING_CONFIGURATION",
    businessUnit: branch ? "MISSING_CONFIGURATION" : "READY",
    editorial: branch ? "OWNER_DECISION" : "READY",
    projects: branch ? "OWNER_DECISION" : "EDITORIAL_ACTION",
    brand:
      siteKey === "group" || siteKey === "healthcare"
        ? "DATA_CORRECTION_REQUIRED"
        : "READY",
    announcement: "READY",
    emergency: "READY",
    media:
      siteKey === "group" || siteKey === "healthcare"
        ? "EDITORIAL_ACTION"
        : "READY",
  };
}

function finding(site, area, classification, evidence, expected, owner, action, verification) {
  return {
    site,
    area,
    classification,
    evidence,
    expectedCanonicalState: expected,
    owner,
    recommendedAction: action,
    destructive: false,
    mutationAuthorized: false,
    verificationMethod: verification,
  };
}

function buildFindings(sites, matrix) {
  const findings = [];
  for (const [siteKey, site] of Object.entries(sites)) {
    const siteName = site.siteName;
    if (!site.inspected) {
      findings.push(
        finding(siteName, "all", "BLOCKED", site.blocker, "All public B1-B7 CMS coordinates inspectable.", "BLOCKED", "Restore authorized read-only endpoint access.", "Rerun the audit."),
      );
      continue;
    }
    if (matrix[siteKey].frontPage === "MISSING_CONFIGURATION") {
      findings.push(
        finding(siteName, "frontPage", "MISSING_CONFIGURATION", `showOnFront=${site.homepage.showOnFront}; pageOnFront=${site.homepage.pageOnFront}; page(id: \"/\", idType: URI)=null`, "A published Branch homepage assigned as the static front page and resolving at URI /.", "CMS_ADMIN_ACTION", "Create/select the approved branch homepage and assign it in Reading Settings after editorial approval.", "Re-query readingSettings and page(id: \"/\", idType: URI)."),
      );
    } else {
      findings.push(
        finding(siteName, "frontPage", "MISSING_CONTENT", `Page ${site.homepage.databaseId} resolves at / with variant=${site.homepage.variant}; all accepted Group hero fields are empty.`, "The configured Group front page contains approved structured Group homepage content.", "EDITORIAL_ACTION", "Supply and approve the Group structured homepage content without changing the canonical / lookup.", "Re-query the accepted SiraHomepage operation and verify populated Group fields."),
      );
    }
    for (const [area, key] of [["primaryMenu", "primary"], ["footerMenu", "footer"], ["legalMenu", "legal"]]) {
      findings.push(
        finding(siteName, area, "MISSING_CONFIGURATION", `Native ${key.toUpperCase()} menu assignment count=${site.menus[key].assignedCount}.`, `Exactly one usable native ${key.toUpperCase()} menu assignment.`, "CMS_ADMIN_ACTION", `Create/approve and assign the ${key.toUpperCase()} menu using native WordPress menu locations.`, `Re-query the accepted SiraNavigation operation and validate hierarchy/URLs.`),
      );
    }
    if (matrix[siteKey].businessUnit === "MISSING_CONFIGURATION") {
      findings.push(
        finding(siteName, "businessUnit", "MISSING_CONFIGURATION", `Expected slug=${site.businessUnit.expectedSlug}; term lookup=null; available term count=${site.businessUnit.availableTerms.length}.`, `A canonical Business Unit term with slug ${site.businessUnit.expectedSlug}.`, "CMS_ADMIN_ACTION", "Create the exact approved term and assign only relevant editorial content; do not derive or rename slugs mechanically.", "Re-query siraBusinessUnit by SLUG and its filtered contentNodes connection."),
      );
    }
    if (matrix[siteKey].editorial === "OWNER_DECISION") {
      const filteredEvidence = site.editorial.branchFiltered
        ? `filtered accepted-family count=${site.editorial.branchFiltered.returnedCount}`
        : "filtered connection unavailable because the exact Business Unit term is missing";
      findings.push(
        finding(siteName, "editorial", "OWNER_DECISION", `Published accepted-family root count=${site.editorial.root.returnedCount}; ${filteredEvidence}.`, "An owner-confirmed intentional empty state or an approved editorial publishing plan.", "OWNER_DECISION", "Decide whether this branch intentionally launches with an empty editorial feed; if not, assign editorial creation to an editor after the Business Unit term exists.", "After the exact term exists, re-query root and branch-filtered accepted editorial connections."),
      );
    }
    if (matrix[siteKey].projects === "OWNER_DECISION") {
      findings.push(
        finding(siteName, "projects", "OWNER_DECISION", `Published project count=${site.projects.returnedPublishedCount}.`, "An owner-confirmed intentional empty archive or an approved project publishing plan.", "OWNER_DECISION", "Decide whether this branch requires launch projects; if yes, commission public project records rather than adding frontend fallbacks.", "Re-query siraProjects and native project-single URIs."),
      );
    } else {
      findings.push(
        finding(siteName, "projects", "EDITORIAL_ACTION", `${site.projects.returnedPublishedCount} published projects; ${site.projects.missingFeaturedImageCount} missing featured images; ${site.projects.missingSubtitleCount} missing subtitles.`, "Every launch-ready project card has approved archive presentation fields.", "EDITORIAL_ACTION", "Supply approved featured images/alt text and project subtitles for the three published projects.", "Re-query siraProjects and verify zero required archive-field gaps."),
      );
    }
    if (matrix[siteKey].brand === "DATA_CORRECTION_REQUIRED") {
      const expected = siteKey === "group"
        ? "SIRA GROUP; primary #cca34b; secondary #172232; accent #cca34b; paper #f7f4ed; ink #20242b."
        : "SIRA Healthcare; primary #2c6dad; secondary #12283f; accent #2c6dad; paper #f3f7fb; ink #1f2932.";
      findings.push(
        finding(siteName, "brand", "DATA_CORRECTION_REQUIRED", `Live name=${site.brand.name}; colors=${JSON.stringify(site.brand.colors)}.`, expected, "CMS_ADMIN_ACTION", "Correct the canonical public brand fields in WordPress using the approved repository identity evidence; do not normalize these values in Next.js.", "Re-query siraBrand and compare exact effective values."),
      );
    }
    if (matrix[siteKey].media === "EDITORIAL_ACTION") {
      const evidence = siteKey === "group"
        ? `Brand logo alt missing=${site.brand.logo.populated && !site.brand.logo.hasAltText}; brand mark populated=${site.brand.mark.populated}; project featured images missing=${site.projects.missingFeaturedImageCount}.`
        : `Brand mark alt missing=${site.brand.mark.populated && !site.brand.mark.hasAltText}.`;
      findings.push(
        finding(siteName, "media", "EDITORIAL_ACTION", evidence, "Public required media has useful alt text, safe URLs, and usable dimensions; launch project cards have approved images where required.", "EDITORIAL_ACTION", "Supply meaningful accessibility text and required project imagery without fabricating assets.", "Re-query public media metadata and verify alt/dimensions/source readiness."),
      );
    }
  }
  return findings;
}

async function execute(endpoint, variables) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`HTTP_${response.status}`);
  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(`GRAPHQL_${payload.errors.map((error) => error.extensions?.code ?? "ERROR").join("_")}`);
  }
  return payload.data;
}

async function main() {
  const envPath = resolve(process.argv[2] ?? ".env.local");
  const outputPath = resolve(process.argv[3] ?? "../artifacts/step-2c3d/content-readiness-live.json");
  const auditedAt = new Date().toISOString();
  const envText = await readFile(envPath, "utf8");
  const environment = Object.fromEntries(
    envText.split(/\r?\n/u).flatMap((line) => {
      const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/u.exec(line);
      return match ? [[match[1], match[2]]] : [];
    }),
  );
  const sites = {};

  for (const [siteKey, config] of Object.entries(SITE_CONFIG)) {
    const endpoint = environment[config.endpointKey] ?? process.env[config.endpointKey];
    if (!endpoint) {
      sites[siteKey] = { siteName: config.name, inspected: false, blocker: "ENDPOINT_NOT_CONFIGURED" };
      continue;
    }
    try {
      const data = await execute(endpoint, {
        businessUnit: config.businessUnit ?? "__group-unfiltered__",
      });
      const rootEditorial = editorialSummary(data.editorial);
      const branchEditorial =
        config.businessUnit && data.branchBusinessUnit
          ? editorialSummary(data.branchBusinessUnit.contentNodes)
          : null;
      sites[siteKey] = {
        siteName: config.name,
        inspected: true,
        homepage: homepageSummary(data, siteKey),
        menus: {
          primary: menuSummary(data.primary),
          footer: menuSummary(data.footer),
          legal: menuSummary(data.legal),
        },
        businessUnit: {
          expectedSlug: config.businessUnit,
          term: config.businessUnit
            ? data.branchBusinessUnit
              ? {
                  databaseId: data.branchBusinessUnit.databaseId,
                  name: data.branchBusinessUnit.name,
                  slug: data.branchBusinessUnit.slug,
                  totalAssignedObjectCount: data.branchBusinessUnit.count,
                }
              : null
            : null,
          availableTerms: (data.businessUnits?.nodes ?? []).map((term) => ({
            databaseId: term.databaseId,
            name: term.name,
            slug: term.slug,
            totalAssignedObjectCount: term.count,
            acceptedEditorialAssignments: editorialSummary(term.acceptedEditorial),
          })),
          availableTermsTruncated:
            data.businessUnits?.pageInfo?.hasNextPage === true,
        },
        editorial: {
          groupRootUnfiltered: siteKey === "group",
          root: rootEditorial,
          branchFiltered: branchEditorial,
        },
        projects: projectSummary(data.projects),
        brand: brandSummary(data.brand, auditedAt),
      };
    } catch (error) {
      sites[siteKey] = {
        siteName: config.name,
        inspected: false,
        blocker: error instanceof Error ? error.message : "UNKNOWN_AUDIT_ERROR",
      };
    }
  }

  const readinessMatrix = Object.fromEntries(
    Object.entries(sites).map(([siteKey, site]) => [siteKey, classifySite(siteKey, site)]),
  );
  const findings = buildFindings(sites, readinessMatrix);
  const classificationCounts = Object.fromEntries(
    READINESS_CLASSIFICATIONS.map((classification) => [classification, 0]),
  );
  for (const row of Object.values(readinessMatrix)) {
    for (const classification of Object.values(row)) {
      classificationCounts[classification] = (classificationCounts[classification] ?? 0) + 1;
    }
  }

  const output = {
    schemaVersion: 1,
    audit: "Step 2C.3D WordPress Content Readiness",
    auditedAt,
    mode: "read-only public GraphQL metadata",
    querySource: basename(import.meta.filename),
    security: {
      endpointValuesPersisted: false,
      credentialsPersisted: false,
      unpublishedBodiesPersisted: false,
      rawPayloadsPersisted: false,
      wordpressMutationOccurred: false,
      backendMutationOccurred: false,
      productionDeploymentOccurred: false,
    },
    limitations: [
      "Public GraphQL proves published/anonymous contract readiness only.",
      "Draft/private totals, WordPress admin provenance, and show_on_front mutation controls require authorized admin/WP-CLI evidence.",
      "Counts are exact only when truncated=false.",
    ],
    readinessMatrix,
    classificationCounts,
    findings,
    historicalRevalidation: {
      branchFrontPages: "UNCHANGED_MISSING",
      nativeMenus: "UNCHANGED_MISSING",
      groupBrand: "UNCORRECTED",
      healthcareBrand: "UNCORRECTED",
    },
    sites,
  };

  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
}

await main();
```

### frontend/tests/contract/step-2c3d-content-readiness.test.ts

```typescript
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const repositoryFile = (relativePath: string): string =>
  readFileSync(new URL(`../../../${relativePath}`, import.meta.url), "utf8");

interface ReadinessArtifact {
  readonly schemaVersion: number;
  readonly mode: string;
  readonly security: Readonly<Record<string, boolean>>;
  readonly readinessMatrix: Readonly<
    Record<string, Readonly<Record<string, string>>>
  >;
  readonly classificationCounts: Readonly<Record<string, number>>;
  readonly findings: readonly {
    readonly classification: string;
    readonly owner: string;
    readonly destructive: boolean;
    readonly mutationAuthorized: boolean;
  }[];
  readonly sites: Readonly<Record<SiteKey, AuditedSite>>;
}

type SiteKey =
  | "group"
  | "consulting"
  | "healthcare"
  | "lifestyle"
  | "realestate";

interface AuditedSite {
  readonly inspected: boolean;
  readonly homepage: { readonly showOnFront: string };
  readonly menus: Readonly<
    Record<"primary" | "footer" | "legal", { readonly assignedCount: number }>
  >;
  readonly businessUnit: {
    readonly expectedSlug: string | null;
    readonly term: { readonly slug: string } | null;
    readonly availableTerms: readonly {
      readonly slug: string;
      readonly acceptedEditorialAssignments: {
        readonly returnedCount: number;
      };
    }[];
  };
  readonly editorial: {
    readonly branchFiltered: { readonly returnedCount: number } | null;
  };
}

describe("Step 2C.3D content readiness evidence", () => {
  const state = JSON.parse(repositoryFile("project-state.json")) as {
    readonly currentStage: string;
    readonly currentSubstage: string;
    readonly productionAuthorized: boolean;
    readonly latestAcceptedIncrement: Readonly<Record<string, unknown>>;
    readonly knownConflicts: readonly Readonly<Record<string, unknown>>[];
  };
  const artifact = JSON.parse(
    repositoryFile("artifacts/step-2c3d/content-readiness.json"),
  ) as ReadinessArtifact;

  it("records accepted Step 2C.3C and keeps protected gates open", () => {
    expect(state).toMatchObject({
      currentStage: "2C.3D",
      currentSubstage: "2C.3D-AUDIT",
      productionAuthorized: false,
      latestAcceptedIncrement: {
        stage: "Step 2C.3C",
        status: "ACCEPTED_MERGED",
        pullRequest: 12,
        implementationHead: "847b0c3f067d9af4f00591c3554a7a693a646017",
        mergeCommit: "4f306733b3e45bee4244688186e5ecae570fcb8b",
        frontendCi: "PASS",
        fullRegression: "22 files / 183 tests PASS",
      },
    });
    expect(state.knownConflicts).toContainEqual(
      expect.objectContaining({ id: "SOT-001", status: "OPEN" }),
    );
  });

  it("contains a complete five-site, eleven-area classified matrix", () => {
    const allowed = [
      "READY",
      "MISSING_CONTENT",
      "MISSING_CONFIGURATION",
      "DATA_CORRECTION_REQUIRED",
      "EDITORIAL_ACTION",
      "OWNER_DECISION",
      "BLOCKED",
    ];
    expect(Object.keys(artifact.readinessMatrix)).toEqual([
      "group",
      "consulting",
      "healthcare",
      "lifestyle",
      "realestate",
    ]);
    for (const row of Object.values(artifact.readinessMatrix)) {
      expect(Object.keys(row)).toHaveLength(11);
      expect(Object.values(row).every((value) => allowed.includes(value))).toBe(
        true,
      );
    }
    expect(
      Object.values(artifact.classificationCounts).reduce(
        (sum, value) => sum + value,
        0,
      ),
    ).toBe(55);
    expect(artifact.classificationCounts).toEqual({
      READY: 18,
      MISSING_CONTENT: 1,
      MISSING_CONFIGURATION: 23,
      DATA_CORRECTION_REQUIRED: 2,
      EDITORIAL_ACTION: 3,
      OWNER_DECISION: 8,
      BLOCKED: 0,
    });
  });

  it("records every tenant as inspected without substituting site data", () => {
    expect(
      Object.values(artifact.sites).every((site) => site.inspected),
    ).toBe(true);
    expect(artifact.sites.group.homepage.showOnFront).toBe("page");
    for (const siteKey of [
      "consulting",
      "healthcare",
      "lifestyle",
      "realestate",
    ] satisfies readonly SiteKey[]) {
      expect(artifact.sites[siteKey].homepage.showOnFront).toBe("posts");
    }
    expect(artifact.sites.group.businessUnit.expectedSlug).toBeNull();
    expect(artifact.sites.realestate.businessUnit.expectedSlug).toBe(
      "real-estate",
    );
  });

  it("proves exact Business Unit slugs and accepted editorial assignments", () => {
    expect(
      artifact.sites.group.businessUnit.availableTerms.map((term) => [
        term.slug,
        term.acceptedEditorialAssignments.returnedCount,
      ]),
    ).toEqual([
      ["consulting", 1],
      ["healthcare", 1],
      ["lifestyle", 1],
      ["real-estate", 1],
    ]);
    for (const siteKey of [
      "consulting",
      "healthcare",
      "lifestyle",
      "realestate",
    ] satisfies readonly SiteKey[]) {
      expect(artifact.sites[siteKey].businessUnit.term).toBeNull();
      expect(artifact.sites[siteKey].editorial.branchFiltered).toBeNull();
    }
  });

  it("records missing native menu configuration independently per tenant", () => {
    for (const site of Object.values(artifact.sites)) {
      expect(site.menus.primary.assignedCount).toBe(0);
      expect(site.menus.footer.assignedCount).toBe(0);
      expect(site.menus.legal.assignedCount).toBe(0);
    }
  });

  it("keeps the artifact sanitized and every correction non-destructive", () => {
    expect(artifact.schemaVersion).toBe(1);
    expect(artifact.mode).toBe("read-only public GraphQL metadata");
    expect(artifact.security).toEqual({
      endpointValuesPersisted: false,
      credentialsPersisted: false,
      unpublishedBodiesPersisted: false,
      rawPayloadsPersisted: false,
      wordpressMutationOccurred: false,
      backendMutationOccurred: false,
      productionDeploymentOccurred: false,
    });
    for (const finding of artifact.findings) {
      expect(finding.classification).not.toBe("READY");
      expect(finding.destructive).toBe(false);
      expect(finding.mutationAuthorized).toBe(false);
      expect([
        "CMS_ADMIN_ACTION",
        "EDITORIAL_ACTION",
        "OWNER_DECISION",
        "FUTURE_FRONTEND_STAGE",
        "BLOCKED",
      ]).toContain(finding.owner);
    }

    const serialized = repositoryFile(
      "artifacts/step-2c3d/content-readiness.json",
    );
    expect(serialized).not.toMatch(/https?:\/\//u);
    expect(serialized).not.toMatch(/authorization|password|cookie/iu);
  });
});
```

### project-state.json

```json
{
  "project": "SIRA Headless Platform",
  "updatedAt": "2026-08-13T04:16:00+03:00",
  "status": "IN_PROGRESS",
  "currentStage": "2C.3D",
  "currentSubstage": "2C.3D-AUDIT",
  "executionBranch": "main",
  "executionBaseline": "4f306733b3e45bee4244688186e5ecae570fcb8b",
  "executionHead": "4f306733b3e45bee4244688186e5ecae570fcb8b",
  "latestApprovedMilestone": "Step 2C.3C",
  "latestApprovedTag": "step-2c3b-approved",
  "productionAuthorized": false,
  "repositoryEvidencePolicy": "evidence-first",
  "latestAcceptedIncrement": {
    "stage": "Step 2C.3C",
    "status": "ACCEPTED_MERGED",
    "pullRequest": 12,
    "implementationHead": "847b0c3f067d9af4f00591c3554a7a693a646017",
    "mergeCommit": "4f306733b3e45bee4244688186e5ecae570fcb8b",
    "frontendCi": "PASS",
    "fullRegression": "22 files / 183 tests PASS"
  },
  "governance": {
    "g0Bootstrap": "COMPLETE",
    "g0MergeCommit": "c26b658b4dfafb82c04af42ca880e6894aefcf0d",
    "g0cGitHubGovernance": "COMPLETE",
    "g0cMergeCommit": "e2a0d425cd7fe435981427d9be33a6e6f9d8f436",
    "canonicalBranch": "main",
    "defaultBranch": "main",
    "branchProtection": "CONFIGURED_NOT_ENFORCED",
    "branchProtectionReason": "GitHub plan limitation for this private repository",
    "compensatingControls": [
      "pull-request workflow",
      "frontend CI",
      "owner approval before merge",
      "no direct agent merge to main"
    ]
  },
  "nextMajorStages": [
    "2C.3C typed frontend query contracts",
    "2C.3D WordPress content readiness",
    "2C.4 production design and data contract audit",
    "3 preview, SEO and discovery",
    "4 production component implementation"
  ],
  "knownConflicts": [
    {
      "id": "SOT-001",
      "subsystem": "backend",
      "status": "OPEN",
      "summary": "GitHub backend source appears older than the verified live GraphQL schema and later migration evidence; reconcile the latest cumulative backend source before modifying backend runtime code."
    }
  ],
  "knownGovernanceIssues": [
    {
      "id": "GOV-001",
      "status": "CLOSED",
      "summary": "Repository default branch is main."
    },
    {
      "id": "GOV-002",
      "status": "CLOSED",
      "summary": "Frontend GitHub Actions CI is installed and has successful workflow evidence from G0-C."
    },
    {
      "id": "GOV-003",
      "status": "WARNING",
      "summary": "A main branch protection rule is configured but GitHub reports it is not enforced for this private repository under the current plan; PR + CI + owner approval remain compensating controls."
    }
  ]
}
```

## 4. Audit-script mutation-capability verification

Broad requested search command and exact output:
```text
rg -n -i '\b(POST|PUT|PATCH|DELETE)\b|wp_remote_post|fetch\s*\(|\bmutation\b|/wp-admin|admin-ajax\.php|/wp-json' frontend/scripts/content-readiness-audit.mjs
```
```text
632:  const response = await fetch(endpoint, {
633:    method: "POST",
752:      "Draft/private totals, WordPress admin provenance, and show_on_front mutation controls require authorized admin/WP-CLI evidence.",
[rg exit 0]
```

GraphQL operation-declaration search:
```text
rg -n '^\s*(query|mutation)\b' frontend/scripts/content-readiness-audit.mjs
```
```text
65:  query SiraContentReadinessAudit($businessUnit: ID!) {
[rg exit 0]
```

Admin endpoint search:
```text
rg -n -i '/wp-admin|admin-ajax\.php|/wp-json' frontend/scripts/content-readiness-audit.mjs
```
```text
[no matches]
[rg exit 1]
```

Match explanations:
- `fetch(endpoint, ...)` and `method: "POST"` are the sole live transport. POST carries a read-only GraphQL query and variables to the configured public GraphQL endpoint; HTTP POST is not itself a CMS mutation.
- The only GraphQL declaration is `query SiraContentReadinessAudit($businessUnit: ID!)`; no GraphQL mutation declaration exists.
- `mutationAuthorized: false`, `wordpressMutationOccurred: false`, and `backendMutationOccurred: false` are negative evidence flags.
- `mutation controls` occurs only in a limitation stating that admin controls were not inspected.
- No PUT, PATCH, DELETE, `wp_remote_post`, WordPress admin endpoint, or REST write endpoint exists.
- Fetch sends only `content-type`; it sends no authorization header, cookie, or credential.

## 5. Tracked-diff security and scope verification

Exact tracked changed-file list:
```text
artifacts/step-2c3d/content-readiness.json
docs/PROJECT-STATE.md
docs/SOURCE-OF-TRUTH.md
docs/STEP-2C3D-CONTENT-READINESS.md
docs/tasks/step-2c3d-content-readiness.md
frontend/scripts/content-readiness-audit.mjs
frontend/tests/contract/b7-durable-state.test.ts
frontend/tests/contract/step-2c3c-closure.test.ts
frontend/tests/contract/step-2c3d-content-readiness.test.ts
project-state.json
```

Endpoint URL literals:
```text
[no matches]
[rg exit 1]
```
Authorization values:
```text
[no matches]
[rg exit 1]
```
Credential-like assignments:
```text
2005:+      parsed.password === ""
[rg exit 0]
```
The only credential-like match is `parsed.password === ""`, a URL-safety rejection guard; it contains no credential value.
Cookie values:
```text
[no matches]
[rg exit 1]
```

Private-content-body review:
```text
1886:+        content(format: RENDERED)
2305:+    body: JSON.stringify({ query: QUERY, variables }),
[rg exit 0]
```
- `content(format: RENDERED)` reads anonymously public Project content only to compute `missingRenderedContentCount`; content values are not persisted.
- `body: JSON.stringify({ query: QUERY, variables })` is the outbound GraphQL request body, not stored CMS content.
- The artifact contains safe public metadata, counts, IDs, presence/safety flags, classifications, and findings; no rendered project body or unpublished/private body is persisted.

Schema-fetch/introspection path search:
```text
[no changed schema, codegen, or generated paths]
[rg exit 1]
```

Forbidden tracked-path search:
```text
[no backend runtime, generated GraphQL, dependency, lockfile, frontend runtime, UI, or component paths]
[rg exit 1]
```

Verification verdict:
- Credentials: none.
- Authorization values: none.
- Endpoint URL values: none; only endpoint environment-variable key names exist.
- Cookies: none.
- Private/unpublished content bodies: none persisted.
- Schema fetch/introspection changes: none.
- Backend runtime files: none.
- Generated GraphQL changes: none.
- Dependencies/lockfiles: none.
- UI/components and frontend runtime files: none.

## 6. Exact final `git status --short`

```text
?? 2C3C-CLOSURE-INDEPENDENT-REVIEW-EVIDENCE.md
?? 2C3D-AUDIT-INDEPENDENT-REVIEW-EVIDENCE.md
```

## 7. SHA-256

Self-reference note: a digest embedded in a file cannot cover itself without changing the digest. The value below covers the exact UTF-8 bytes through the preceding `git status --short` section. The complete-file SHA-256 is calculated after writing and returned out-of-band.

```text
7722fcdd82a795022f6078b55ebb661fc24d67ff0a6d8da5c53ffbea238d7f93
```
