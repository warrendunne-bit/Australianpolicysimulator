# Australia Policy Simulator

Australia Policy Simulator is a React, Vite and TypeScript app for exploring simple Australian policy trade-offs over time. It lets users adjust policy settings such as migration, housing supply, integration, skills alignment, infrastructure readiness, tax and stimulus, then compare illustrative outcomes across growth, wellbeing, social cohesion, environmental pressure and government finances.

The project is designed as a clear public-facing simulator rather than a precise economic model. It helps people reason about trade-offs and unintended consequences, but it should not be treated as an official forecast, policy cost estimate or calibrated prediction of Australia's future.

## What the simulator is for

- Testing broad policy settings in a simple interactive interface.
- Seeing how one setting can improve one outcome while worsening another.
- Making assumptions visible enough for discussion and iteration.
- Supporting a lightweight GitHub Pages deployment for public sharing.

## Important limitation

This simulator is illustrative only. The model uses simplified representative entities and hand-authored relationships between inputs and outputs. Results are not official statistics, forecasts, budget projections or policy advice.

## Local development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Run the simulator tests:

```bash
npm test
```

Build the default production app for GitHub Pages:

```bash
npm run build
```

Build the Vercel/root-domain version locally:

```bash
npm run build:vercel
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment: GitHub Pages and Vercel

This project deliberately supports two deployment targets with different asset paths:

| Target | Source branch | Build command | Asset base | Purpose |
| --- | --- | --- | --- | --- |
| GitHub Pages | `gh-pages` static output | `npm run deploy` | `/Australianpolicysimulator/` | Public GitHub Pages site under the repository path |
| Vercel | `main` source branch | `npm run build:vercel` | `/` | Root-hosted Vercel site |

Do not point Vercel at the `gh-pages` branch. The `gh-pages` branch contains already-built static files for GitHub Pages, not the source app and dependencies Vercel needs to build from.

### GitHub Pages deployment

The app is published through GitHub Pages using Vite's static build output.

Deploy with:

```bash
npm run deploy
```

The deployment script builds the app first via `predeploy`, then publishes the `dist` folder using `gh-pages`:

```bash
npm run build:github
gh-pages -d dist --nojekyll
```

GitHub Pages must serve the `gh-pages` branch from the `/` root folder. The generated HTML should reference assets like:

```html
/Australianpolicysimulator/assets/...
```

### Vercel deployment

Vercel should deploy from the `main` branch, not `gh-pages`.

The repo-level [`vercel.json`](./vercel.json) pins the Vercel build settings:

```json
{
  "framework": "vite",
  "installCommand": "npm install",
  "buildCommand": "npm run build:vercel",
  "outputDirectory": "dist"
}
```

The Vercel build should produce root-relative assets like:

```html
/assets/...
```

If Vercel shows an old version while GitHub Pages is current, check whether the app source changes were committed and pushed to `main`. `npm run deploy` can publish local built output to GitHub Pages, but Vercel only sees committed source from `main`.

If a Vercel build log says `Branch: gh-pages` or fails with `vite: command not found`, the project is building the wrong branch. Change the Vercel project or deploy hook to use `main`.

## Vite base path assumption

This repository defaults to the GitHub Pages repository path, while Vercel builds override the base to `/`:

```ts
const base = process.env.VERCEL ? '/' : '/Australianpolicysimulator/'
```

That setting lives in `vite.config.ts` and must match the GitHub Pages repository URL path. If the repository name or Pages path changes, update the GitHub Pages base value before building and deploying.

Do not remove the Vite base path unless the app is moved to a custom domain or a root-level site where `/` is the correct base.

## Safe change workflow

Before publishing changes, run tests and both deployment builds:

```bash
npm test
npm run build
npm run build:vercel
npm run build
```

The final `npm run build` leaves the local `dist` folder in the GitHub Pages-compatible state.

For changes that should appear on both sites:

1. Commit and push source changes to `main` so Vercel can build them.
2. Confirm Vercel deploys from `main` and shows the current UI.
3. Run `npm run deploy` to publish GitHub Pages if the Pages site also needs updating.

Then deploy with:

```bash
npm run deploy
```

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md) for notable project changes.
