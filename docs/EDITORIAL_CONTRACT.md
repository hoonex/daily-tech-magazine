# Editorial contract for ChatGPT

The scheduled ChatGPT task is the editorial engine. The repository must not call a paid LLM API.

For each morning issue:

1. Research current news on the web, prioritizing official announcements, original research and Reuters-quality reporting.
2. Select exactly 10 non-duplicate stories relevant to AI/LLMs, agents, coding tools, game development, Valorant/games, PC/mobile hardware, robotics, science/future tech and AI companies/markets.
3. Keep facts separate from analysis and 6–24 month outlook. Mark credible but unconfirmed items with `status: "unconfirmed"`.
4. Choose exactly three story IDs for `top3`.
5. Keep at least one direct HTTPS source URL on every story.
6. For each TOP 3 story, also write a short Instagram card payload under `card`: `{ "stat": "one striking number/keyword", "headline": "short hook", "what": "one compact fact block", "why": "one compact importance block", "next": "one compact outlook block", "hook": "optional cover-worthy hook" }`. Never invent a number just to make the card stronger; a verified keyword is better than a fake statistic.
7. Keep card copy glanceable: `headline` preferably <= 28 Korean characters, `what` <= 110 characters, `why` <= 85 characters, and `next` <= 90 characters.
8. Add a short top-level `recap` (preferably <= 45 Korean characters) that captures the day in one strong sentence for slide 5.
9. Optionally add a top-level `cover`: `{ "stat": "verified number/keyword", "title": "strong two-line hook", "subtitle": "short TOP 3 promise" }`. Keep the cover curiosity-driven but factual.
10. Try to find a relevant reusable visual for each TOP 3 story during the same ChatGPT web research. Prefer Wikimedia Commons/Public Domain/Creative Commons material with a clearly stated license. Never copy a random article photo merely because it is visible on the web.
11. Only attach `visual` when reuse permission is actually verified. Use this shape: `{ "url": "direct HTTPS image URL", "credit": "creator/owner", "license": "CC0 1.0 / CC BY ... / Public Domain", "sourceUrl": "HTTPS file/license page", "reuseAllowed": true, "modified": "cropped and darkened" }`. If rights are unclear, omit `visual` and let the renderer use its original graphical background.
12. Write the complete issue to both `content/YYYY-MM-DD.json` and `content/latest.json` on `main`.
13. Do not write generated carousel images. GitHub Actions owns deterministic rendering.
14. Do not claim the GitHub write succeeded unless the remote operation actually returns success.

## Carousel v2 rules

- Exactly 5 slides: hook cover, TOP 1, TOP 2, TOP 3, visual recap/CTA.
- Slides 1–4 are visual-first. Slide 5 uses the TOP 3 visuals as a collage when available.
- Card copy must be glanceable: short blocks, no source wall, no long analysis slide.
- Detailed source URLs and image-license details belong in the generated caption. On-card photo credit is deliberately tiny.
- The renderer embeds the account handle/brand on every slide as a subtle watermark. Use top-level `handle` when the final Instagram handle is known.
- Source facts still live in the normal story fields; `card`, `cover`, and `recap` are concise presentation layers, not replacements for verified editorial data.

If repository write capability is unavailable during a scheduled run, still deliver the normal user-facing Korean news brief and clearly report that the GitHub publication step was skipped.
