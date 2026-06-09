---
"@medalsocial/nextmedal": patch
---

Fix the article/newsletter social-share buttons sharing the previous page's URL after client-side navigation between detail pages. The share URL now recomputes from the current pathname on each route change.
