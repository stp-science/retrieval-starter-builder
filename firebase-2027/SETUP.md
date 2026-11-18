# Science Retrieval Studio 2027

New staff builder for the October 2026 STP 2027 Years 7–10 unit-plan sequence. Deployed separately under `/retrieval-starter-builder/2027/`; the existing builder remains available.

## Included

- 29 core topics and two labelled optional topics; 119 learning focuses.
- Original knowledge statements retained as source evidence. Questions use short answers and missing-word recall, with stable identifiers.
- Five activity layouts, classroom presentation, answer reveal and browser print/PDF.
- Unused-first selection, oldest-used fallback, explicit previously-used browsing, teacher-selected questions and revisit flags.
- Per-teacher, per-class history with Google authentication and Firestore, once configured. Activity generation does not mark questions as used. Press Mark activity as used after teaching.
- Device-only preview when Firebase is unconfigured. This is clearly labelled and never presented as cloud sync. Preview history is separate from signed-in history.

## Connect Firebase

This project is NOT currently connected to a live Firebase project. No live school authentication or cloud history has been tested.

1. Select or create a school-owned Firebase project. Add a Web app and copy its public `firebaseConfig` from Project settings. Never supply a service-account private key.
2. Enable Google in Authentication > Sign-in method. Choose the school support email.
3. Add `stp-science.github.io` under Authentication > Settings > Authorized domains (no protocol, path or port).
4. Use a Firestore Native database supporting the modular Web SDK. The prototype was tested against the Standard-edition emulator. Confirm the chosen database edition and location before provisioning or deployment. Avoid test-mode public rules.
5. Replace `firebaseConfig = null` in `public/2027/config.js` with the copied public web config object. The app uses the `(default)` database. If a named database is selected, update `getFirestore` accordingly.
6. From the repository's `firebase-2027` directory, authenticate the Firebase CLI and deploy the rules to the selected project: `firebase deploy --only firestore:rules --project YOUR_PROJECT_ID`.
7. Push config changes. Test school Google sign-in, rejection of outside accounts, save/reload across devices, separate class histories and separate teacher histories before staff rollout.

The `hd` parameter only suggests the school domain. Actual history access is checked by Firestore rules using verified email, Google provider and matching UID. An email domain alone does not distinguish staff from students: use a staff allowlist or school-managed staff claims if pupils also have `@stpeters.school.nz` accounts.

## Data model

`teachers/{uid}/classes/{normalisedClassName}/questions/{questionId}`

Fields: `count` (integer), `lastUsed` (server timestamp or null), `revisit` (boolean). No student data, passwords or profile records are stored. Counts update in transactions. Class names are normalised to lowercase with collapsed spaces; teachers should use consistent names across devices. Renaming a class currently opens a separate history rather than migrating it.

## Validation

Run `node --test selection.test.js` with `curriculum.json` and `selection.js` in the same directory. The suite checks curriculum order, all-focus question coverage, cloze reconstruction, unique IDs, strict history filtering and unused-first/oldest-used selection.

The Firestore emulator compiles the prototype rules. Live Google OAuth and the school's Firebase deployment still require verification. Review questions before use; source knowledge is visible in each card. Automatic missing-word questions are deliberately labelled.
