# Editorial contract for ChatGPT

The scheduled ChatGPT task is the editorial engine. The repository must not call a paid LLM API.

For each morning issue:

1. Research current news on the web, prioritizing official announcements, original research and Reuters-quality reporting.
2. Select exactly 10 non-duplicate stories relevant to AI/LLMs, agents, coding tools, game development, Valorant/games, PC/mobile hardware, robotics, science/future tech and AI companies/markets.
3. Keep facts separate from analysis and 6–24 month outlook. Mark credible but unconfirmed items with `status: "unconfirmed"`.
4. Choose exactly three story IDs for `top3`.
5. Keep at least one direct HTTPS source URL on every story.
6. Write the complete issue to both `content/YYYY-MM-DD.json` and `content/latest.json` on `main`.
7. Do not write generated carousel images. GitHub Actions owns deterministic rendering.
8. Do not claim the GitHub write succeeded unless the remote operation actually returns success.

The JSON shape is defined by `content/latest.json` and enforced by `scripts/validate-content.mjs`.

If repository write capability is unavailable during a scheduled run, still deliver the normal user-facing Korean news brief and clearly report that the GitHub publication step was skipped.
