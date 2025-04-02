## Sprint Plan - Sprint 1: Core Loop Foundation

**Sprint Goal:** Establish the foundational backend and frontend components to initiate and execute
a single iteration of the AutoVibe core loop, enabling users to input a seed and trigger the
`autocode-ai` process on the backend.

**Sprint Duration:** 1 week (Adjust as needed based on team capacity) **Sprint Start Date:** Mon Apr
07 2025 **Sprint End Date:** Fri Apr 11 2025

**Selected User Stories/Tasks:**

| ID     | Title                                              | Priority | Type    | Estimated Effort |
| :----- | :------------------------------------------------- | :------- | :------ | :--------------- |
| AV-001 | Implement API Key Input & Handling                 | [High]   | Feature | 3 story points   |
| AV-002 | Implement Seed Input UI                            | [High]   | Feature | 1 story point    |
| AV-003 | Implement `/api/kickoff` Endpoint                  | [High]   | Feature | 5 story points   |
| AV-004 | Implement `/api/loop` Endpoint (Basic Loop)        | [High]   | Feature | 8 story points   |
| AV-005 | Frontend Kickoff Logic                             | [High]   | Feature | 3 story points   |
| AV-007 | Frontend UI - Core Layout & Iframes (Placeholders) | [High]   | Feature | 2 story points   |
| AV-010 | Integrate AutoCode CLI Execution                   | [High]   | Feature | 5 story points   |

**Total Estimated Effort:** 27 story points

**Sprint Item Breakdown and Details:**

1.  **AV-001: Implement API Key Input & Handling (3 story points)**

    - **Description:** Develop the frontend UI element (input field) for users to enter their API
      key. Implement JavaScript to save the API key to the browser's Local Storage when the "Save
      API Key" button is clicked. On the backend (`app.js`), implement middleware or logic to
      extract the API key from the `Authorization: Bearer` header in incoming requests.
    - **Tasks:**
        - Frontend: Create API key input field and "Save" button in `index.html`.
        - Frontend: Implement JavaScript to handle "Save" button click and store API key in Local
          Storage (`AutoVibeApiKey`).
        - Backend: Implement middleware or function in `app.js` to extract API key from
          `Authorization` header.
    - **Dependencies:** None
    - **Risks:** Potential issues with browser Local Storage access or header parsing in NodeJS.

2.  **AV-002: Implement Seed Input UI (1 story point)**

    - **Description:** Create a textarea in the frontend (`index.html`) for users to input their
      seed prompt.
    - **Tasks:**
        - Frontend: Add a textarea element with appropriate labels and styling to `index.html` for
          seed input.
    - **Dependencies:** None
    - **Risks:** Minimal.

3.  **AV-003: Implement `/api/kickoff` Endpoint (5 story points)**

    - **Description:** Develop the `/api/kickoff` POST endpoint in `app.js`. This endpoint should:
        - Receive the seed and model from the request body.
        - Validate the model against `ALLOWED_MODELS`.
        - Generate a unique timestamp-based folder name.
        - Create the project folder structure (`./projects/{timestamp}/1/`).
        - Create initial files in the iteration `1` folder: `README.md` (containing the seed), and
          empty `index.html`, `style.css`, `script.js`.
        - Return a `201 Created` response with JSON:
          `{ "folderName": "...", "initialIteration": 1 }`.
    - **Tasks:**
        - Backend: Create `/api/kickoff` endpoint in `app.js` using Express.js.
        - Backend: Implement model validation against `ALLOWED_MODELS`.
        - Backend: Implement folder creation logic and initial file creation.
        - Backend: Implement response handling and JSON response structure.
    - **Dependencies:** None
    - **Risks:** File system operations might have permission issues or errors. Model validation
      logic might need refinement.

4.  **AV-004: Implement `/api/loop` Endpoint (Basic Loop) (8 story points)**

    - **Description:** Develop the `/api/loop` POST endpoint in `app.js`. This endpoint (for this
      sprint, in a basic form) should:
        - Receive `folderName`, `model`, and `iteration` from the request body.
        - Copy files from the previous iteration folder (`N-1`) to the current iteration folder
          (`N`).
        - **For this sprint, focus on basic CLI execution and success/error response. Detailed error
          handling and output parsing can be in later sprints.** Execute the
          `autocode-ai generate {model} {apiKey}` command within the iteration folder using
          `child_process.exec`.
        - Return a `200 OK` response on successful CLI execution (even if content is not fully
          validated yet), and error response on CLI failure. Include basic success/failure message
          and iteration number in the JSON response.
    - **Tasks:**
        - Backend: Create `/api/loop` endpoint in `app.js`.
        - Backend: Implement file copying from previous iteration.
        - Backend: Implement `child_process.exec` call to `autocode-ai generate` command with model
          and API key.
        - Backend: Implement basic success/error handling for CLI execution and response generation.
    - **Dependencies:** AV-003 (project folder structure needs to be in place). `autocode-ai` CLI
      tool needs to be available in the environment.
    - **Risks:** `autocode-ai` CLI execution might be complex to integrate. Error handling for CLI
      execution (timeouts, errors) needs to be implemented. API key needs to be passed securely to
      CLI (via arguments in this MVP).

5.  **AV-005: Frontend Kickoff Logic (3 story points)**

    - **Description:** Implement the JavaScript logic in `index.html` to handle the "Run Vibing
      Loop" button click. This logic should:
        - Retrieve the API key from Local Storage.
        - Get the seed text from the seed textarea.
        - Disable the "Run" button and potentially show a "Stop" button (basic UI change).
        - Send a POST request to `/api/kickoff` with the seed and a default model (for now, hardcode
          `gemini-2.0-flash-thinking-exp-01-21`). Include the API key in the `Authorization` header.
        - On successful response from `/api/kickoff`, store the `folderName` and set
          `currentIteration = 1` in frontend JavaScript variables.
    - **Tasks:**
        - Frontend: Implement JavaScript event listener for "Run Vibing Loop" button.
        - Frontend: Implement API key retrieval from Local Storage and seed retrieval from textarea.
        - Frontend: Implement `fetch` call to `/api/kickoff` with seed, default model, and API key
          in header.
        - Frontend: Implement basic UI feedback (button state change).
        - Frontend: Handle successful response from `/api/kickoff` and store `folderName`,
          `currentIteration`.
    - **Dependencies:** AV-001, AV-002, AV-003 need to be at least partially implemented to test
      this.
    - **Risks:** Frontend API call logic and response handling might have errors.

6.  **AV-007: Frontend UI - Core Layout & Iframes (Placeholders) (2 story points)**

    - **Description:** Set up the basic HTML structure in `index.html`. This includes:
        - Sections for API Key input, Seed input, Run/Stop buttons, and a "Live Previews" section.
        - Placeholders for the README Preview and Generated HTML Preview iframes. **For this sprint,
          these iframes will be placeholders and will not be dynamically updated with content.** The
          focus is on setting up the UI structure.
    - **Tasks:**
        - Frontend: Structure `index.html` with sections for different UI elements as described.
        - Frontend: Add placeholder `<iframe>` elements for README and HTML previews in the "Live
          Previews" section. Basic styling can be added.
    - **Dependencies:** None
    - **Risks:** Basic HTML structure and layout. Minimal risk.

7.  **AV-010: Integrate AutoCode CLI Execution (5 story points)**
    - **Description:** Implement the core logic in the `/api/loop` endpoint (AV-004) to execute the
      `autocode-ai generate` command using NodeJS `child_process.exec`. Ensure the command is
      executed with the correct model and API key, and within the appropriate iteration folder as
      the current working directory. Capture basic CLI output and handle potential errors (timeouts,
      command failures).
    - **Tasks:**
        - Backend: Implement `child_process.exec` call within `/api/loop` endpoint to execute
          `autocode-ai generate {model} {apiKey}`.
        - Backend: Set the `cwd` (current working directory) for `child_process.exec` to the
          iteration folder.
        - Backend: Capture basic CLI output (stdout/stderr - for logging/debugging, not necessarily
          for frontend display in this sprint).
        - Backend: Implement basic timeout handling for `child_process.exec` (e.g., default 10
          minutes from README).
    - **Dependencies:** AV-004 (endpoint structure), `autocode-ai` CLI tool availability.
    - **Risks:** `child_process.exec` integration can be tricky, especially with error handling and
      timeouts. Passing API key securely via command arguments in this MVP might be a temporary
      solution; security should be reviewed in later sprints.

**Dependencies Summary:**

- AV-004 depends on AV-003 and `autocode-ai` CLI.
- AV-005 depends on AV-001, AV-002, AV-003.
- AV-010 depends on AV-004 and `autocode-ai` CLI.

**Sprint Risks:**

- Integration complexity with `autocode-ai` CLI.
- Error handling in backend and frontend API interactions.
- Time estimation might be inaccurate for initial CLI integration tasks.

**Definition of Done for Sprint 1:**

- **API Key Input & Storage:** Users can input and save their API key in the browser.
- **Seed Input UI:** A textarea for seed input is present in the UI.
- **`/api/kickoff` Endpoint Functional:** The backend endpoint successfully creates project folders
  and initial files upon receiving a seed.
- **`/api/loop` Endpoint (Basic):** The backend endpoint can copy files, execute `autocode-ai` CLI,
  and return a basic success/error response after CLI execution.
- **Frontend Kickoff Logic Implemented:** Frontend JavaScript can initiate the kickoff process by
  calling `/api/kickoff`.
- **Basic UI Layout:** Core UI sections and placeholders for iframes are in place in `index.html`.
- **CLI Execution Integrated:** The backend can execute the `autocode-ai` CLI within the iteration
  loop.
- **Project Folders Created:** Project and iteration folders are created on the server file system
  with initial and iterated files.

**Out of Scope for Sprint 1:**

- Live preview updates in iframes.
- Detailed error handling and UI error display.
- Model selection UI and backend model handling beyond default.
- Stop functionality.
- "Share Project Link" and "Open HTML" features.
- Responsive design.
- Frontend polling loop for iterations beyond kickoff.

This sprint plan focuses on building the essential backbone of AutoVibe, setting the stage for more
advanced features and UI enhancements in subsequent sprints. Prioritization is on achieving a
functional, albeit basic, core loop first.
