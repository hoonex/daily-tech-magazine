# Editorial contract for ChatGPT

The scheduled ChatGPT task is the editorial engine. The repository must not call a paid LLM API.

For each morning issue:

1. Research current news on the web, prioritizing official announcements, original research and Reuters-quality reporting.
2. Select exactly 10 non-duplicate stories relevant to AI/LLMs, agents, coding tools, game development, Valorant/games, PC/mobile hardware, robotics, science/future tech and AI companies/markets.
3. Keep facts separate from analysis and 6–24 month outlook. Mark credible but unconfirmed items with `status: "unconfirmed"`.
4. Choose exactly three story IDs for `top3`.
5. Keep at least one direct HTTPS source URL on every story.
6. For each TOP 3 story, try to find a relevant reusable visual during the same ChatGPT web research. Prefer Wikimedia Commons/Public Domain/Creative Commons material with a clearly stated license. Never copy a random article photo merely because it is visible on the web.
7. Only attach `visual` when reuse permission is actually verified. Use this shape: `{ "url": "direct HTTPS image URL", "credit": "creator/owner", "license": "CC0 1.0 / CC BY ... / Public Domain", "sourceUrl": "HTTPS file/license page", "reuseAllowed": true, "modified": "cropped and darkened" }`. If rights are unclear, omit `visual` and let the renderer use its original graphical background.
8. Write the complete issue to both `content/YYYY-MM-DD.json` and `content/latest.json` on `main`.
9. Do not write generated carousel images. GitHub Actions owns deterministic rendering.
10. Do not claim the GitHub write succeeded unless the remote operation actually returns success.

The renderer uses a licensed TOP 1 visual as the cover when available and a licensed visual on each TOP 3 story card. Visual credits and licenses are printed on the cards/caption. The JSON shape is defined by `content/latest.json` and enforced by `scripts/validate-content.mjs`.

If repository write capability is unavailable during a scheduled run, still deliver the normal user-facing Korean news brief and clearly report that the GitHub publication step was skipped.
