# Daily Tech Magazine

A zero-extra-AI-cost pipeline for turning the daily ChatGPT tech brief into an Instagram-style editorial carousel.

The AI/news research happens in the existing ChatGPT scheduled task. ChatGPT writes the finished, sourced issue JSON into this repository. GitHub Actions then renders the JSON into 1080×1350 images and can optionally publish the carousel to Instagram.

## Pipeline

```text
ChatGPT scheduled news brief (07:00 KST)
  -> web research + selection + analysis inside ChatGPT
  -> commit content/YYYY-MM-DD.json + content/latest.json
  -> GitHub Actions
  -> validate JSON
  -> render 7 JPEG cards
  -> commit public/output/YYYY-MM-DD/*.jpg
  -> optional Instagram carousel publish
```

There is **no OpenAI API key** in this repository and no OpenAI API bill from this pipeline.

## Carousel layout

1. Cover / issue identity / today's TOP 3
2. TOP 1 deep card
3. TOP 2 deep card
4. TOP 3 deep card
5. Seven more stories
6. Daily analysis / what the day means
7. Sources / closing card

All cards are 1080×1350 (4:5). If no reusable image is supplied, cards use an original editorial gradient/geometry background.

## Content format

`content/latest.json` is the canonical current issue. It contains exactly 10 stories and three `top3` IDs. Each story separates facts, importance, analysis and outlook and includes source URLs.

Run locally:

```bash
npm install
npm run validate
npm run render
```

The resulting images are written to `public/output/<date>/`.

## Instagram publishing

Publishing is disabled by default. When ready, configure repository settings:

- Secret: `INSTAGRAM_ACCESS_TOKEN`
- Secret: `INSTAGRAM_USER_ID`
- Variable: `INSTAGRAM_API_VERSION` (the Meta Graph API version you intentionally choose)
- Variable: `INSTAGRAM_AUTO_PUBLISH=true`

The publisher uses public raw GitHub image URLs, waits for them to become reachable, creates carousel child containers, creates the carousel container, then publishes it. A successful post writes `state/instagram/<date>.json` so reruns skip that issue.

Do not enable automatic publishing until the rendered cards have been reviewed at least once.

## ChatGPT scheduled task

The scheduled task should continue to send the normal Korean news brief to ChatGPT, then write the same issue in the JSON schema used here. If the GitHub write capability is unavailable on a particular scheduled run, the user-facing brief should still be delivered and the task should clearly say the repository publish step was skipped rather than pretending it succeeded.
