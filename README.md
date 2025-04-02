# AutoVibe

**AutoVibe** is a free web platform designed to empower users with rapid iterative "vibe coding"
capabilities. It enables users to explore ideas and generate unexpected outcomes at lightning speed
by running potentially thousands of Large Language Model (LLM) iterations based on an initial seed
input.

![alt text](image.png)

The core concept revolves around providing a simple seed idea and letting an AI iteratively build
upon it, using tools like AutoCode in the background to generate code (HTML, CSS, JS) and content
(README). Users can observe the evolution of the project in real-time through live previews and stop
the process whenever they find a desirable outcome.

**Production URL:** [https://autovibe.dev](https://autovibe.dev)

**Key Goals & Philosophy:**

- **Bring Your Own API Key:** Users provide their own (free) API key (e.g., from Google AI Studio),
  ensuring transparency and control over API usage. Secure handling of the key (via browser local
  storage) is prioritized.
- **Seed-Based Creativity:** The process starts with a user-provided "seed" (initial idea or
  prompt), guiding the AI's exploration.
- **Rapid Iteration:** Leverage LLMs to perform many iterations quickly, exploring diverse
  possibilities from the initial seed.
- **Ease of Use:** Offer an intuitive web interface requiring minimal setup.
- **Leverage AutoCode:** Utilize the `autocode-ai` CLI tool within the iterative loop for structured
  code and content generation based on the evolving project state.
- **Discover Unexpected Outcomes:** Embrace the emergent nature of iterative AI generation to find
  novel solutions and creative directions.

## 2. Key Features

- **Web-Based Interface:** Accessible via any modern web browser at
  [autovibe.dev](https://autovibe.dev).
- **Seed Input:** Users provide an initial text prompt to start the iterative process.
- **API Key Management:** Securely stores the user's API key in browser local storage. Supports keys
  from providers compatible with the backend models.
- **Model Selection:** Allows users to choose from a curated list of supported LLMs (e.g., Gemini
  Flash, Gemini Pro, Claude Sonnet, DeepSeek, O3 Mini), balancing speed and capability.
- **Iterative Loop:** Backend process manages the execution of potentially thousands of iterations
  based on the seed and selected model.
- **AutoCode Integration:** Uses the `autocode-ai` CLI tool within each iteration to update project
  files (`README.md`, `index.html`, `style.css`, `script.js`).
- **Live Previews:** Displays the generated `README.md` (rendered as HTML) and `index.html` in
  side-by-side iframes, updating after each successful iteration.
- **Real-time Status:** Shows the current iteration number and indicates when the loop is running or
  stopped. Provides status messages for kickoff, iteration progress, success, and errors.
- **Loop Control:** Users can start and stop the iterative loop at any time.
- **File System Storage:** Each session creates a unique, timestamped folder on the server to store
  iteration results, allowing direct access to generated files if needed (via URL).
- **Sharing:** Allows users to copy a direct link to the `index.html` of the latest completed
  iteration for a specific project.
- **Open HTML:** Provides a button to open the latest generated `index.html` in a new browser tab.
- **Responsive Design:** The user interface adapts to different screen sizes.

## 3. Architecture

AutoVibe employs a simple client-server architecture with file-system based storage for session
data.

### 3.1. Backend (`app.js`)

- **Technology:** Single NodeJS application built with Express.js. Uses Bun as the runtime.
- **Responsibilities:**
    - Serves the static frontend (`index.html`, CSS, JS, images).
    - Provides API endpoints for the frontend (`/api/kickoff`, `/api/loop`).
    - Handles the core "thinking loop" process initiation and iteration execution.
    - Receives the seed input, selected model, and API key from the frontend.
    - Manages the creation and population of unique project folders on the server's file system
      (`./projects/{timestamp}/{iteration}/`).
    - Executes the `autocode-ai` CLI command using Node's `child_process.exec` within the
      appropriate project iteration directory.
    - Validates user input and API keys (basic format check).
    - Validates selected models against an allowed list (`ALLOWED_MODELS`).
    - Handles errors during file operations or CLI execution (including timeouts).
    - Sends results (folder name, iteration status, error messages) back to the frontend via
      standard HTTP JSON responses.
    - Includes basic security measures like preventing path traversal when serving project files.
    - Uses `morgan` for request logging.
- **Allowed Models:**
    - `gemini-2.0-flash-thinking-exp-01-21` (Default/Fast)
    - `gemini-2.5-pro-exp-03-25` (Better/Slower/Rate limited)
    - `claude-3-7-sonnet-20250219`
    - `deepseek-reasoner`
    - `o3-mini`

### 3.2. Frontend (`index.html`)

- **Technology:** Single HTML file containing structure (HTML), styling (CSS within `<style>` tags),
  and logic (JavaScript within `<script>` tags). Uses the `marked` library to render Markdown.
- **Responsibilities:**
    - Provides the user interface for:
        - Inputting the API Key.
        - Inputting the seed prompt.
        - Selecting the LLM model.
        - Starting and stopping the loop.
    - Stores the API key and preferred model in the browser's Local Storage.
    - Communicates with the backend API (`/api/kickoff`, `/api/loop`) using asynchronous `fetch`
      requests.
    - Sends the API key securely in the `Authorization: Bearer <key>` header.
    - Displays status messages, iteration count, and loading indicators.
    - Dynamically updates the `src` or `srcdoc` attributes of the `<iframe>` elements to display the
      latest `README.md` and `index.html` from the corresponding project folder URL served by the
      backend.
    - Handles user interactions like button clicks (Run, Stop, Save API Key, Share, Open HTML).
    - Provides links to external resources (Google AI Studio, GitHub).

### 3.3. File System Storage

- **Location:** A directory named `projects` resides in the application's root directory on the
  server.
- **Structure:**
    - Each time a user starts a new loop ("kickoff"), a new folder is created inside `projects`
      named with the current Unix timestamp (e.g., `projects/1678886400000`).
    - Inside each timestamped project folder, subfolders are created for each iteration, named
      numerically (e.g., `1`, `2`, `3`, ...).
    - Iteration `1` contains the initial files:
        - `README.md`: Contains the user's seed input.
        - `index.html`: Basic placeholder HTML.
        - `style.css`: Basic placeholder CSS.
        - `script.js`: Basic placeholder JS.
    - For subsequent iterations (e.g., iteration `N`), the backend first copies all files from
      iteration `N-1` into the new folder `N`. Then, it runs the `autocode-ai` CLI within the folder
      `N`, which modifies the files (`README.md`, `index.html`, etc.) in place based on its
      generation process.
- **Access:** Files within these folders are served statically by the backend via the `/projects/`
  route, allowing the frontend iframes to load them.

### 3.4. External Dependencies

- **AutoCode CLI (`autocode-ai`):** The core AI generation engine used within each iteration. The
  backend executes this tool via `bunx autocode-ai generate <model> <apiKey>`. It's expected to read
  the current state from files (like `README.md`) in its working directory and update them based on
  the LLM interaction.
- **LLM APIs (e.g., Google AI):** The AutoCode CLI relies on external LLM APIs. The user provides
  their own API key, which is passed to the CLI by the backend.

## 4. Module Interactions / Workflow

1.  **Initialization (User Loads Page):**

    - User navigates to `https://autovibe.dev`.
    - Browser loads `index.html`.
    - Client-side JavaScript runs:
        - Loads API key from Local Storage (if present) into the input field.
        - Loads preferred model from Local Storage (if present) into the dropdown.
        - Sets up event listeners for buttons and forms.

2.  **API Key Setup (First time / Update):**

    - User pastes their API key into the "Your Google AI API Key" field.
    - User clicks "Save API Key".
    - JavaScript saves the key to Local Storage and displays a confirmation message.

3.  **Loop Kickoff:**

    - User enters a "seed" prompt into the textarea.
    - User selects a desired LLM model from the dropdown.
    - User clicks the "Run Vibing Loop" button.
    - Frontend JS:
        - Validates that API key, seed, and model are present.
        - Retrieves the API key from Local Storage.
        - Disables the "Run" button, enables and shows the "Stop" button.
        - Displays a "Kicking off..." status message.
        - Sends a `POST` request to `/api/kickoff` with `{ seed: "...", model: "..." }` in the body
          and `Authorization: Bearer <apiKey>` in the headers.

4.  **Backend Kickoff Processing (`/api/kickoff`):**

    - `app.js` receives the request.
    - Validates the `Authorization` header and extracts the API key.
    - Validates the `seed` and `model` from the request body.
    - Generates a unique `folderName` (current Unix timestamp).
    - Creates the directory structure: `./projects/{folderName}/1/`.
    - Writes the `seed` content to `./projects/{folderName}/1/README.md`.
    - Creates initial placeholder `index.html`, `style.css`, and `script.js` in
      `./projects/{folderName}/1/`.
    - Responds to the frontend with `201 Created` and JSON:
      `{ "folderName": "...", "initialIteration": 1 }`.

5.  **Frontend Kickoff Response Handling:**

    - Frontend JS receives the successful kickoff response.
    - Stores the `folderName` and sets `currentIteration` to `1`.
    - Updates the iteration counter display ("Iteration 1").
    - Calls `updateResultPreviews(folderName, 1)`:
        - Fetches `/projects/{folderName}/1/README.md`, renders it using `marked`, and loads it into
          the README iframe (`srcdoc`).
        - Sets the `src` of the HTML preview iframe to `/projects/{folderName}/1/index.html`.
        - Enables the "Share" and "Open HTML" buttons.
    - Scrolls the page to the results section.
    - Calls the `runIteration()` function to start the first actual AI iteration.

6.  **Iterative Loop Execution (Frontend initiates):**

    - Frontend JS (`runIteration()`):
        - Checks if `isLoopRunning` is `true`.
        - Determines the next iteration number (`iterationToRun = currentIteration + 1`).
        - Updates UI: Shows spinner, displays "Running iteration {iterationToRun}..." status.
        - Retrieves API key and selected model.
        - Sends a `POST` request to `/api/loop` with
          `{ folderName: "...", model: "...", iteration: iterationToRun }` and
          `Authorization: Bearer <apiKey>`.

7.  **Backend Iteration Processing (`/api/loop`):**

    - `app.js` receives the request.
    - Validates inputs (`folderName`, `model`, `iteration`, API key).
    - Checks if the project folder and the _previous_ iteration folder exist.
    - Creates the directory for the _current_ iteration:
      `./projects/{folderName}/{iterationToRun}/`.
    - Copies all files from the previous iteration folder
      (`./projects/{folderName}/{iterationToRun - 1}/`) to the current iteration folder.
    - Executes the command: `bunx autocode-ai generate {model} {apiKey}` with the `cwd` (current
      working directory) set to `./projects/{folderName}/{iterationToRun}/`.
        - This command interacts with the specified LLM API using the provided key.
        - It modifies the files (`README.md`, `index.html`, etc.) within the current iteration
          folder.
    - Waits for the command to complete (or timeout - default 600s).
    - If successful, responds with `200 OK` and JSON:
      `{ "success": true, "message": "...", "cliOutput": "...", "iteration": iterationToRun }`.
    - If failed (CLI error, timeout, invalid API key, safety block, etc.), responds with an
      appropriate error status code (400, 401, 429, 500, 504) and JSON:
      `{ "success": false, "message": "...", "error": "...", "iteration": iterationToRun }`.

8.  **Frontend Iteration Response Handling:**

    - Frontend JS receives the response from `/api/loop`.
    - **On Success:**
        - Updates `currentIteration` to the received `iteration` number.
        - Updates UI: Hides spinner, shows success message, updates iteration counter ("Iteration
          {N}").
        - Calls `updateResultPreviews(folderName, currentIteration)` to refresh the iframes with the
          newly generated content.
        - If `isLoopRunning` is still `true`, schedules the next call to `runIteration()` using
          `setTimeout` (e.g., after 500ms).
    - **On Failure:**
        - Displays the error message received from the backend.
        - Calls `stopLoop()` to halt the process.

9.  **Stopping the Loop:**

    - User clicks the "Stop Loop" button.
    - Frontend JS (`stopLoop()`):
        - Sets `isLoopRunning = false`.
        - Clears any pending `setTimeout` for the next iteration (`clearTimeout(loopTimeoutId)`).
        - Updates UI: Disables "Stop" button, hides it, enables "Run" button, hides spinner.
        - Displays a "Loop stopped" status message.
        - Keeps the previews showing the last successfully completed iteration.

10. **Sharing:**

    - User clicks the "Share Project Link" button (enabled after first iteration).
    - Frontend JS copies the URL
      `https://autovibe.dev/projects/{folderName}/{currentIteration}/index.html` to the clipboard.
    - Displays a temporary "Link copied!" feedback message.

11. **Opening HTML:**
    - User clicks the "Open HTML" button (enabled after first iteration).
    - Frontend JS opens the URL `/projects/{folderName}/{currentIteration}/index.html` in a new
      browser tab.

## 5. API Endpoints

| Method | Path                                       | Description                                                                                                  | Request Body                                                   | Headers                          | Success Response                                                                          | Error Response                                                                    |
| :----- | :----------------------------------------- | :----------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------- | :------------------------------- | :---------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| `GET`  | `/`                                        | Serves the main `index.html` frontend application.                                                           | N/A                                                            | N/A                              | `200 OK` with HTML content                                                                | `404 Not Found` (if Accept header isn't HTML)                                     |
| `POST` | `/api/kickoff`                             | Initializes a new project session and the first iteration based on a seed.                                   | `{ "seed": "string", "model": "string" }`                      | `Authorization: Bearer <apiKey>` | `201 Created` `{ "folderName": "...", "initialIteration": 1 }`                            | `400 Bad Request`, `401 Unauthorized`, `500 Internal Server Error` (JSON error)   |
| `POST` | `/api/loop`                                | Executes the next iteration of the AutoCode process for a given project.                                     | `{ "folderName": "...", "model": "...", "iteration": number }` | `Authorization: Bearer <apiKey>` | `200 OK` `{ "success": true, "message": "...", "cliOutput": "...", "iteration": number }` | `400`, `401`, `404`, `429`, `500`, `504` (JSON error `{ "success": false, ... }`) |
| `GET`  | `/projects/{folderName}/{iter}/{fileName}` | Serves static files generated during iterations (e.g., `index.html`, `README.md`, `style.css`, `script.js`). | N/A                                                            | N/A                              | `200 OK` with file content                                                                | `403 Forbidden` (Path Traversal), `404 Not Found`                                 |
| `GET`  | `/api/*`                                   | Catch-all for undefined API routes.                                                                          | N/A                                                            | N/A                              | N/A                                                                                       | `404 Not Found` `{ "message": "API endpoint not found." }`                        |

## 6. Usage Instructions (Getting Started)

To start using autovibe.dev:

1.  **Access the Website:** Navigate to [https://autovibe.dev](https://autovibe.dev).
2.  **Configure API key:**
    - Scroll down to the "Manage API Key" section.
    - Obtain a free API key from [Google AI Studio](https://aistudio.google.com/apikey) (or another
      supported provider if applicable).
    - Paste the key into the "Your Google AI API Key" input field.
    - Click "Save API Key". The key is stored locally in your browser.
3.  **Input Your Seed:**
    - Scroll to the "Start Your Loop" section.
    - Enter your initial idea, concept, or prompt into the "Enter Your Seed" textarea. This defines
      the starting point (`README.md` for Iteration 1).
4.  **Select Model:** Choose the desired AI model from the dropdown menu. Your preference is saved
    locally.
5.  **Run the Loop:** Click the "Run Vibing Loop" button.
    - Observe the status messages and the iteration counter below the button.
    - The page will scroll down to the "Live Previews" section.
6.  **Explore Output:**
    - Wait for the first iteration results to appear in the "README Preview" and "Generated HTML
      Preview" iframes.
    - The iframes will refresh automatically as subsequent iterations complete.
    - You can interact with the content within the "Generated HTML Preview" iframe.
7.  **Stop:** If you want to stop the process, click the red "Stop Loop" button that appears while
    the loop is running. The loop will terminate after the current iteration finishes (if one is in
    progress), and you can review the results generated up to that point.
8.  **Share / Open:** Once the loop is stopped or has run at least one iteration, you can:
    - Click "Share Project Link" to copy the URL of the latest `index.html` preview to your
      clipboard.
    - Click "Open HTML" to open the latest `index.html` preview in a new tab.

## 7. Installation (Local Development)

To set up the project for local development:

1.  **Prerequisites:**
    - Install [Bun.sh](https://bun.sh/).
    - Ensure `git` is installed.
    - Ensure the `autocode-ai` CLI tool is accessible in your environment (e.g., via
      `bunx autocode-ai` or globally installed). Check [AutoCode setup](https://autocode.work/).
2.  **Clone the Repository:**
    ```bash
    git clone https://github.com/msveshnikov/autovibe
    cd autovibe
    ```
3.  **Install Dependencies:**
    ```bash
    bun install
    ```
4.  **Run the Application:**
    ```bash
    bun run start
    ```

````
5.  **Access:** Open your web browser and navigate to `http://localhost:3000` (or the port specified
 by `process.env.PORT`).

## 8. Deployment (Docker)

The project includes configuration for Docker deployment using `Dockerfile` and
`docker-compose.yml`.

1.  **Build the Docker Image (Optional):**

 - You can build the image locally: `docker build -t autovibe-local .`
 - Or use the pre-built image: `extender777/autovibe` (as specified in `docker-compose.yml`)

2.  **Run using Docker Compose:**

 - Ensure Docker and Docker Compose are installed.
 - Create a `projects` directory in the same location as the `docker-compose.yml` file if it
   doesn't exist: `mkdir projects`
 - Run the command:
     ```bash
     docker-compose up -d
     ```
 - This will start the AutoVibe backend service using the specified image
   (`extender777/autovibe`).
 - It maps port `8030` on the host to port `3000` inside the container.
 - It mounts the local `./projects` directory to `/app/projects` inside the container, ensuring
   generated project files persist on the host.
 - The service is configured to restart automatically unless explicitly stopped.

3.  **Access:** The application should be accessible at `http://<your-docker-host-ip>:8030`.

4.  **Stopping:**
 ```bash
 docker-compose down
 ```

## 9. Configuration

- **API Keys:** Managed client-side via the UI and stored in browser Local Storage
(`AutoVibeApiKey`). Passed to the backend via the `Authorization` header for each API call.
- **LLM Models:** Selected client-side via a dropdown. The chosen model ID (`AutoVibeSelectedModel`)
is stored in Local Storage and sent to the backend with `/api/kickoff` and `/api/loop` requests.
The backend validates the model against `ALLOWED_MODELS` defined in `app.js` and uses the default
if an invalid or no model is provided.
- **Port:** The backend server runs on port `3000` by default, but can be configured via the `PORT`
environment variable. The Docker Compose setup maps host port `8030` to this container port.
- **AutoCode Timeout:** The execution timeout for the `autocode-ai` CLI command is hardcoded in
`app.js` (`executionTimeout = 600000` ms, i.e., 10 minutes).

## 10. Design Ideas and Future Considerations

These are potential areas for future development, based on the initial README:

**User Interface & Experience (UI/UX):**

- **Iteration History & Management:** Allow browsing, comparing, selecting, and downloading previous
iteration states (`README.md` and `index.html` versions) within a session.
- **Advanced Configuration:** Add options for LLM temperature, max tokens, or specific `autocode-ai`
CLI flags directly in the UI.
- **Seed Templates:** Offer pre-defined seed examples for common use cases (landing pages,
components, etc.).

**Backend & Architecture:**

- **Database Integration:** Replace file-system storage with a database (e.g., MongoDB, PostgreSQL)
for better querying, management, scalability, and potential user account features.
- **State Management:** Implement more robust backend state tracking for loops (`pending`,
`running`, `completed`, `failed`, `stopped`).
- **Session Persistence:** Allow users to save and resume sessions (requires user authentication and
database storage).

## 11. Contributing

Contributions are welcome! Please refer to the `CONTRIBUTING.md` file for guidelines on submitting bug reports, feature requests, and pull requests.

## 12. License

This project is licensed under the **MIT License**. (See `LICENSE` file).


# TODO
````
