# Australia Social Simulator - Agent Instructions

## Project Goal

This is a React + Vite + TypeScript app published through GitHub Pages. The goal is to build a simple but credible simulator that helps people test Australian policy settings and see trade-offs across GDP growth, happiness/wellbeing, fairness, environment, social cohesion and government finances.

The simulator is illustrative only. It is not a forecast, official model, budget estimate or policy recommendation.

## Operating Rules

- Always confirm the current project folder before making changes.
- Never create a duplicate app folder unless explicitly asked.
- Preserve the existing Vite + GitHub Pages deployment setup.
- Do not remove or casually change the Vite `base` setting.
- Before coding, state:
  - files likely affected
  - acceptance criteria
- Prefer small, safe changes over large rewrites.
- Separate:
  - UI changes
  - model logic changes
  - data changes
  - documentation changes
- Do not commit, push or deploy unless explicitly asked.
- Protect the existing working app; avoid broad refactors unless the user approves them.

## Validation

Every code change must be validated with:

```bash
npm run build
```

When simulation/model logic changes, also run:

```bash
npm test
```

Before publishing, run:

```bash
npm test
npm run build
npm run deploy
```

## Model Guidance

- Make assumptions explicit.
- Avoid pretending the simulator is more precise than it is.
- Keep formulas simple and explainable.
- When adding metrics, add tests for expected directionality.
- Prefer transparency over false precision.
- Clearly label illustrative scores and trade-offs.
- Do not present outputs as official Australian statistics or forecasts.

## Deployment Notes

The app is deployed to GitHub Pages using:

```bash
npm run deploy
```

The current Vite base path is:

```ts
base: '/Australianpolicysimulator/'
```

Only change this if the GitHub Pages path or domain changes.

Deployment currently publishes the `dist` folder using `gh-pages` and keeps GitHub Pages compatible with `--nojekyll`.

## Recommended Change Workflow

1. Confirm the repository folder and git status.
2. Identify likely affected files and acceptance criteria.
3. Make the smallest safe change.
4. Run the required validation command(s).
5. Check git status.
6. Summarise changed files and any publish steps.
