# Retrieval Starter Builder

A classroom retrieval-practice generator for St Peter's School, Cambridge.

**Live app:** [stp-science.github.io/retrieval-starter-builder](https://stp-science.github.io/retrieval-starter-builder/)

Teachers choose a year group, one or more previously taught topics, and an activity format. The app selects from a checked question bank and creates a ready-to-use starter with answers. It does not require an AI account or generate questions with AI.

## Features

- 1,240 topic-guide-checked questions across 31 Year 7-9 Science topics
- 40 questions in every Year 7-9 topic bank
- 24 retrieval-practice activity formats
- animated **Surprise me** wheel
- individual **Swap** controls for replacing unwanted questions
- difficulty and question-count controls
- answer reveal, classroom display, print, PDF and Word export options
- full-screen classroom presentation mode with live answer controls
- editable teacher-written questions and focused knowledge prompts
- editable PowerPoint question and answer slides where appropriate
- St Peter's Cambridge branding

The expanded activity catalogue includes retrieval clocks, picture prompts,
question chains, match-ups, cloze recall, flashcard sprints, Two Things and
Connect Four alongside the original 16 formats.

Activity-specific behaviour includes four-question retrieval placemats,
mixed-topic List It prompts, single-topic concept maps, focused Brain Dump and
Cops & Robbers prompts, connected Question Chains, labelled Picture Prompts,
context-rich cloze statements, automatic Flashcard Sprint answers and
one-question-at-a-time Retrieval Roulette reveals.

## Included topics

### Year 7

- Material Properties
- States of Matter and the Particle Model
- Cells and Organisation
- Thermal Energy
- Diffusion
- Cellular Respiration
- Deformation and Friction
- Photosynthesis
- Ecosystem Interactions
- Rocks and Minerals

### Year 8

- Mixtures, Solutions and Concentration
- Solubility
- Reproduction
- Static Electricity
- Chemical Change
- Genetic Material and Inheritance
- Digestive System
- Gas Exchange
- Pressure
- Adaptation and Evolution
- Stars and Planets

### Year 9

- Elements, Molecules and Compounds
- The Periodic Table
- Determining Organism Traits
- Chemical Reactions
- The Effect of Forces
- Fluids and Pressure
- Transport Systems in Humans
- Transport Systems in Plants
- Spheres of the Earth
- Ecosystems

## Editing the content

The Years 7-9 topic definitions and guide-derived questions are loaded through `app/curriculum-topics.ts`. Topics whose source bank began with eight guide questions receive 32 additional guide-aligned questions from `app/junior-guide-supplements.ts`.

Generic year-group expansion questions are deliberately disabled for Years 7-9. Run `npm run audit:junior-guides` to verify the 31 active topic IDs, 40 unique questions per topic and the unit-specific scope guards.

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

- `app/page.tsx` - interface and activity generators
- `app/curriculum-topics.ts` - active Years 7-9 topic definitions and guide-derived banks
- `app/junior-guide-supplements.ts` - guide-aligned questions for the original 14 topic banks
- `scripts/audit-junior-guide-scope.ts` - automated Years 7-9 curriculum-scope audit
- `app/globals.css` - responsive styling and school colour palette
- `public/stpeters-crest.webp` - school crest used in the interface
- `tests/` - rendered-app check

The app is hosted on GitHub Pages. Every push to `main` automatically builds and publishes the latest version through the GitHub Pages workflow.
