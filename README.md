# Retrieval Starter Builder

A classroom retrieval-practice generator for St Peter's School, Cambridge.

**Live app:** [stp-science.github.io/retrieval-starter-builder](https://stp-science.github.io/retrieval-starter-builder/)

Teachers choose a year group, one or more previously taught topics, and an activity format. The app selects from a checked question bank and creates a ready-to-use starter with answers. It does not require an AI account or generate questions with AI.

## Features

- 600 questions across 15 Year 7-9 Science topics
- 40 questions in every topic bank
- 24 retrieval-practice activity formats
- animated **Surprise me** wheel
- individual **Swap** controls for replacing unwanted questions
- difficulty and question-count controls
- answer reveal, classroom display, print, PDF and Word export options
- St Peter's Cambridge branding

The expanded activity catalogue includes retrieval clocks, picture prompts,
question chains, match-ups, cloze recall, flashcard sprints, Two Things and
Connect Four alongside the original 16 formats.

## Included topics

### Year 7

- Material Properties
- States of Matter and the Particle Model
- Cells and Organisation
- Thermal Energy

### Year 8

- Mixtures, Solutions and Concentration
- Solubility
- Reproduction
- Chemical Changes

### Year 9

- Elements, Molecules and Compounds
- The Periodic Table
- Determining Traits
- Chemical Reactions
- Acids and Bases
- Effects of Forces
- Pressure and Fluids

## Editing the content

The topic definitions and first eight questions for each topic are in `app/page.tsx`. The remaining 32 questions per topic are in `app/question-bank.ts`.

Each question has:

- a question and answer
- a difficulty level: `foundation`, `core` or `stretch`
- a response type: `short` or `explain`

New topics can be added by following the existing topic structure and adding a matching question-bank entry.

## Local development

Requirements:

- Node.js 22.13 or later
- npm

Install and start the development server:

```bash
npm ci
npm run dev
```

Run the checks:

```bash
npm test
npm run lint
```

## Project structure

- `app/page.tsx` - interface, topic definitions and activity generators
- `app/question-bank.ts` - expanded checked question bank
- `app/globals.css` - responsive styling and school colour palette
- `public/stpeters-crest.webp` - school crest used in the interface
- `tests/` - rendered-app check

The app is hosted on GitHub Pages. Every push to `main` automatically builds and publishes the latest version through the GitHub Pages workflow.
