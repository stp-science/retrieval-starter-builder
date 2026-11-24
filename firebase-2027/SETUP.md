# Science Retrieval Studio 2027

New staff builder for the October 2026 STP 2027 Years 7–10 unit-plan sequence. Deployed separately under `/retrieval-starter-builder/2027/`; the existing builder remains available.

## Included

- 29 core topics and two labelled optional topics; 119 learning focuses.
- Original knowledge statements retained as source evidence. Questions use short answers and missing-word recall, with stable identifiers.
- All 24 original activity implementations, the random activity wheel, the shared original design and preview, and original presentation, print/PDF, Word and PowerPoint controls.
- Automatic unused-question selection with a confirmation dialog showing only the selected class’s last starter. Teachers tick repeats or choose “Don’t include any” before generating.
- Per-teacher, per-class history with Google authentication and Firestore, once configured. Generating a starter saves the questions for the selected class automatically.
- Device-only preview when Firebase is unconfigured. This is clearly labelled and never presented as cloud sync. Preview history is separate from signed-in history.

## Connect Firebase

The live builder is connected to `stp-science-retrieval-2027`. School Google sign-in was confirmed during setup on 25 November 2026. The steps below document the connection process.

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

Fields: `count` (integer), `lastUsed` (server timestamp or null), `revisit` (boolean). No student data, passwords or profile records are stored. Counts update in transactions. Class names are normalised to lowercase with collapsed spaces; teachers should use consistent names across devices. Teachers name their classes during first-time setup and can add or delete classes later.

## Validation

Run `node --test tests/class-retrieval.test.mjs tests/staff-2027.test.mjs` from the repository root after a static build. These check per-class selection, exclusion of used questions, explicit repeats, question counts, activity parity and curriculum coverage. The older standalone selection tests only cover the retired prototype.

The Firestore emulator compiles the prototype rules. Live Google OAuth and the school's Firebase deployment still require verification. Review questions before use; source knowledge is visible in each card. Automatic missing-word questions are deliberately labelled.

## Original-layout restoration

The live 2027 route is now implemented in `app/2027/page.tsx`, sharing the original global styles and export enhancers. Its active question bank is `app/2027/curriculum.json`; the old standalone `public/2027/index.html` entrypoint has been removed. Public `config.js` and `firebase-store.js` are still used for Firebase setup. Run `node --test tests/staff-2027.test.mjs` after a static build to verify catalogue parity and curriculum coverage. Fixed-size boards keep their question limit. When fresh content runs low, teachers can choose more learning or explicitly tick previous questions to fill the starter.

## Named class setup and history

Publish the updated `firestore.rules` along with the app changes before enabling sign-in. Each teacher creates named classes (for example 9PL and 9SG) on their first visit after sign-in. Class documents store only `name` and `year` at `teachers/{uid}/classes/{classId}`. The class ID is the encoded, normalised name. Teachers select one class before generating. Generate opens a dialog containing only questions from the last saved starter, all unticked; teachers choose repeats or “Don’t include any”, then confirm generation. Question histories change only after confirmation. Every question in the new starter is saved together with the same transaction timestamp, which identifies the last starter without additional Firestore rules. Swapping a question saves the full revised starter as the latest batch. Deleting a class from Manage classes confirms and deletes that class document and its question history.

When `public/2027/config.js` has `firebaseConfig = null`, setup and histories work in a device-only preview. Google sign-in and cross-device class lists require the school Firebase configuration and the updated deployed rules.
