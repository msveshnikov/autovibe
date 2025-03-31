Okay, here is the Sprint Plan for the upcoming sprint, focusing on establishing the core user interaction flow and session initiation based on the current backlog and project state.

---

# AutoVibe Sprint Plan: Sprint 1

**Sprint Dates:** Mon Mar 31 2025 - Fri Apr 11 2025 (Assuming a 2-week sprint)

**Sprint Goal:** **Establish the initial user interaction flow and session creation.**

By the end of this sprint, a user should be able to:
1.  Load the AutoVibe frontend (`index.html`).
2.  Input their Gemini API key and an initial seed prompt.
3.  Click a "Run" button to initiate a session via the `/api/kickoff` endpoint.
4.  See a basic loading indicator while the backend creates a unique session folder (`./projects/{timestamp}`) containing an initial `README.md` (with the seed) and empty `index.html`, `style.css`, `script.js`.
5.  View the initial content of the created `README.md` and `index.html` within side-by-side iframes on the frontend.

This sprint focuses on setting up the foundational structure and the critical path *up to* the point where the iterative loop would begin in the next sprint.

---

## Selected Backlog Items for Sprint 1 (Max 7)

| ID     | Title                                          | Priority | Type    | Estimate (SP) | Notes                                                                                             |
| :----- | :--------------------------------------------- | :------- | :------ | :------------ | :------------------------------------------------------------------------------------------------ |
| AV-007 | Frontend UI - Core Layout & Iframes            | [High]   | Feature | 3 SP          | Create basic HTML structure: inputs, button, spinner placeholder, side-by-side iframes. Basic CSS. |
| AV-001 | Implement API Key Input & Handling (Frontend)  | [High]   | Feature | 2 SP          | Frontend input field for API key. Securely pass value to JS for API call (NOT stored locally).    |
| AV-002 | Implement Seed Input UI                        | [High]   | Feature | 1 SP          | Frontend textarea for the user's seed input.                                                      |
| AV-003 | Implement `/api/kickoff` Endpoint              | [High]   | Feature | 5 SP          | Backend: Create endpoint, receive seed/key, create session folder & initial files (`README.md` with seed, empty `index.html`, `style.css`, `script.js`), return session ID. |
| AV-005 | Frontend Kickoff Logic                       | [High]   | Feature | 3 SP          | Frontend JS: On "Run", get inputs, call `/api/kickoff`, handle response (store session ID), trigger loading state. |
| AV-008 | Backend Static File Serving for Projects     | [High]   | Feature | 3 SP          | Backend (`app.js`): Configure static file serving for `./projects/{session_id}/` path.            |
| AV-011 | Basic Loading/Spinner Indicator                | [High]   | Feature | 1 SP          | Frontend: Show/hide a simple spinner element during the `/api/kickoff` request.                   |
| **Total** |                                                |          |         | **18 SP**     |                                                                                                   |

*Note: Story Points (SP) are used for relative estimation (1, 2, 3, 5, 8...).*

---

## Dependencies and Risks

**Dependencies:**

*   **AV-005 (Frontend Kickoff Logic)** depends on:
    *   AV-001, AV-002: UI elements must exist to get input values.
    *   AV-003: The `/api/kickoff` endpoint must be implemented and functional.
    *   AV-011: Spinner element must exist to be shown/hidden.
*   **AV-007 (Frontend UI - Iframes)** depends on:
    *   AV-008: Backend must correctly serve files from the session folder for iframes to load content.
*   **AV-008 (Backend Static Serving)** depends on:
    *   AV-003: Session folders and initial files must be created first.
*   **Environment:** Assumes a working Node.js/Bun development environment is set up as per `README.md`.

**Risks:**

*   **API Key Security (AV-001, AV-003):** Risk of mishandling the API key (e.g., accidental client-side storage, insecure logging). **Mitigation:** Strict adherence to passing the key directly to the backend for immediate use/forwarding, never storing it client-side, careful backend logging. Code reviews focused on security.
*   **File System Permissions (AV-003):** The backend Node.js process might lack write permissions to create `./projects/` subfolders and files. **Mitigation:** Test permissions early, document necessary setup steps for developers/deployment.
*   **Static File Serving Complexity (AV-008):** Correctly configuring Express/Node to serve static files from dynamic session-based paths can be tricky (routing, path resolution). **Mitigation:** Dedicated testing for this endpoint and iframe loading.
*   **`/api/kickoff` Complexity (AV-003):** This involves multiple steps (validation, folder creation, file writing) and could take longer than estimated. **Mitigation:** Allow for potential spill-over or break down further if significant roadblocks appear.
*   **Iframe Loading Issues (AV-007, AV-008):** Potential for cross-origin issues (if domains differ later) or path errors preventing iframe content display. **Mitigation:** Ensure same-origin policy is met, rigorously test iframe source path construction and backend serving.

---

## Definition of Done (DoD) for Sprint 1

All selected items (AV-001, AV-002, AV-003, AV-005, AV-007, AV-008, AV-011) must meet the following criteria to be considered "Done":

1.  **Code Complete:** All necessary code (HTML, CSS, JavaScript, Node.js) has been written.
2.  **Functionality Implemented:**
    *   User can input Seed and API Key in the UI.
    *   Clicking "Run" sends data to `/api/kickoff`.
    *   Backend successfully creates the session folder and initial files (`README.md` containing the seed, empty `index.html`, `style.css`, `script.js`).
    *   Backend successfully serves files from the created session folder.
    *   Frontend displays a loading indicator during kickoff.
    *   Frontend receives the session ID and correctly sets the `src` attribute for the iframes.
    *   The initial `README.md` and `index.html` content are visible within the respective iframes after kickoff completes.
3.  **Code Quality:** Code adheres to basic project style guidelines (e.g., Prettier configured via `.prettierrc`). Code is reasonably commented where complex logic exists.
4.  **Testing:** Functionality has been manually tested through the user flow described in the Sprint Goal. Basic error conditions (e.g., failed API call) show a console error (formal UI error display is not required for this sprint).
5.  **Review:** Code has been peer-reviewed (e.g., via GitHub Pull Request).
6.  **Merged:** Code has been merged into the main development branch (e.g., `main` or `develop`).
7.  **No Critical Bugs:** No known blocking issues prevent the core sprint goal functionality from working.

---