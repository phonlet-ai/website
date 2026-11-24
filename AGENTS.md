# AGENTS.md — Phonlet website

The site of Phonlet Wake, at phonletai.com. Read this and [PLAN.md](PLAN.md) first. The product
itself (engine, model, SDKs, generator) lives in
[phonlet-ai/wake](https://github.com/phonlet-ai/wake).

## Stack and layout

Next.js 16 (App Router, static export; see the note below), React, strict TypeScript, plain CSS
with `light-dark()` tokens in `app/globals.css`, zod for configuration, Playwright with axe for
browser tests. Every page is prerendered into `out/` and served by GitHub Pages.

| Path                                      | What                                                                                                                                                                  |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/`                                    | Routes: home (`page.tsx` + `home.css`), `docs/[slug]`, `generator`, contact, privacy, `llms.txt`, `agents.md`, sitemap, robots                                        |
| `features/lab/`                           | The home-page lab: keyword-file types, the generator hook (WebAssembly worker), the listener (microphone + browser SDK) and the lab component                         |
| `features/generator/`                     | The `/generator` page                                                                                                                                                 |
| `components/`                             | Shared UI: navigation, footer, code blocks and tabs, docs shell, the hero's signal canvas, footprint, page motion                                                     |
| `lib/`                                    | Content and data: code samples, platform docs, the pulse channel between lab and art, site configuration, theme                                                       |
| `public/wake/`, `public/generator/`       | The Phonlet Wake browser SDK with the `en-1` model and the site's keyword file, and the threshold generator (WebAssembly + worker), all pinned by `asset-hashes.json` |
| `public/CNAME`, `public/.nojekyll`        | GitHub Pages: the custom domain, and no Jekyll processing                                                                                                             |
| `scripts/serve.mjs`, `scripts/deploy.sh`  | A local static server that behaves like GitHub Pages, and the deploy to the `gh-pages` branch                                                                         |
| `tests/engine.test.mjs`, `tests/browser/` | Hash, keyword-file and engine golden checks (Node), and Playwright tests                                                                                              |

## Rules

- **One product.** The site is about Phonlet Wake only. No prices, no competitor names, no
  comparative accuracy claims before a published benchmark.
- **Claims match evidence.** Every figure names its source in PLAN.md: ESP32-S3 numbers are the
  ones measured on hardware, memory and CPU figures name the build and the measurement. Never
  present a preview as live inference or an estimate as a measurement.
- **Licence copy.** Free for non-commercial use under PolyForm Noncommercial 1.0.0; commercial use
  by contact. No licence keys, locks or online checks.
- **Every code sample works.** Samples live in `lib/samples.ts` and `lib/sdk-docs.ts`;
  `tests/browser/samples.spec.ts` runs the browser samples unchanged, and each SDK example is run
  as published against its SDK before it changes.
- **Served assets are frozen.** `asset-hashes.json` pins every engine, model and generator file
  under `public/`; they are copied from a Phonlet Wake release and change only together with their
  hashes and the golden tests.
- **Static only.** No server code, rewrites, redirects or custom headers: GitHub Pages serves files.
  Routes that are not pages (`llms.txt`, `agents.md`, sitemap, robots) are `force-static`.
- **Microphone and motion.** The microphone starts only after a deliberate click and every stream,
  worker, audio context and timer stops on stop and unmount. All animation respects reduced motion;
  every control has an accessible name and visible keyboard focus.
- **No history files** and no private paths in the repository. Never commit credentials,
  recordings, caches or `node_modules`.
- **Deploys are deliberate.** Push or deploy only when the maintainer asks.

## Verify a change

```sh
npm run check        # strict TypeScript, asset hashes, engine golden tests
npm run build        # static export into out/
npm start            # serves out/ on port 3002 like GitHub Pages
npm run test:e2e     # Playwright against the running server (axe at 1440 and 390 px, both themes)
```

Review desktop and phone screenshots in both themes for visual changes. Record what was verified
in PLAN.md and in the commit message.

## Next.js 16

This Next.js version has breaking changes: APIs, conventions and file structure may differ from
what you know. Read the relevant guide in `node_modules/next/dist/docs/` before writing code, and
heed deprecation notices.
