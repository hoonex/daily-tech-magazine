# Repository instructions

This repository is the rendering/publishing half of Daily Tech Magazine.

## Source of truth

- Daily editorial content is committed as JSON under `content/`.
- `content/latest.json` is the current issue consumed by the renderer.
- Do not invent news inside render/publish scripts. Editorial facts must come from the committed JSON.
- Generated carousel images live in `public/output/<YYYY-MM-DD>/`.

## Development protocol

Use Sloar Chat Coder principles for repository work: recover exact repository identity before edits, work on an isolated branch, verify what actually ran, and re-check remote state before publication.

## Safety

- Never commit API tokens or Instagram credentials.
- Instagram publishing stays opt-in via repository variables/secrets.
- Do not auto-republish third-party article photos. `visualUrl` is optional and must only be used when reuse is permitted; otherwise the renderer creates an original editorial background.
