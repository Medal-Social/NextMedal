---
"@medalsocial/nextmedal": patch
---

Fix live content bugs: in-page anchor links use fixed anchors shared by the site and the Studio link picker; links on translated pages go to the translated page or, if none exists, to the source-language page; italic renders as `<em>`; form button, thank-you and consent texts are editable per language and event registration enforces the form's consent; pricing shows its prices again. Adds the `nm-fixes` content migration (anchor params, prices, form texts, translation groups) with a string inventory, and points staging at its own `staging` dataset.
