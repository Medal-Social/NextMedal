---
"@medalsocial/nextmedal": patch
---

Keep QA fixture URLs out of sitemap alternate-language links, approve the YouTube thumbnail host `i.ytimg.com`, and fix the PDF flipbook so controls meet the 44px tap target, the page slider follows Arabic (RTL), and leaving the page aborts an in-flight PDF download. The social-embed QA route now checks `ALLOW_QA_SOCIAL_EMBEDS` on each request and publishes locale SEO metadata plus Organization, WebSite, and BreadcrumbList structured data.
