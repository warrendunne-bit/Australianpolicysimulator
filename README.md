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

Build the production app:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## GitHub Pages deployment

The app is published through GitHub Pages using Vite's static build output.

Deploy with:

```bash
npm run deploy
```

The deployment script builds the app first via `predeploy`, then publishes the `dist` folder using `gh-pages`:

```bash
npm run build
gh-pages -d dist --nojekyll
```

## Vite base path assumption

This repository is configured for GitHub Pages under the repository path:

```ts
base: '/Australianpolicysimulator/'
```

That setting lives in `vite.config.ts` and must match the GitHub Pages repository URL path. If the repository name or Pages path changes, update the Vite `base` value before building and deploying.

Do not remove the Vite base path unless the app is moved to a custom domain or a root-level site where `/` is the correct base.

## Safe change workflow

Before publishing changes, run:

```bash
npm test
npm run build
```

Then deploy with:

```bash
npm run deploy
```

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md) for notable project changes.
