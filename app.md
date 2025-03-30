Okay, here is the Markdown documentation for the `app.js` file.

---

# Documentation: `app.js`

## Overview

`app.js` is the main server file for the AutoVibe application, built using the Express.js framework for Node.js. Its primary responsibilities include:

1.  **Serving the Frontend:** Serves the main `index.html` file and associated static assets (CSS, JavaScript, images).
2.  **Managing Project Lifecycle:** Provides API endpoints to initiate new coding projects (`/api/kickoff`) and run iterative code generation steps (`/api/loop`).
3.  **Orchestrating Code Generation:** Interacts with an external command-line tool (`autocode-ai`) via Node.js's `child_process` module to perform the actual code generation based on instructions in a project's `README.md`.
4.  **Project File Management:** Creates and manages project-specific directories within a `projects` folder, storing generated code (HTML, CSS, JS) and the project's `README.md`.
5.  **Serving Project Files:** Securely serves the generated files within each project directory so they can be previewed in the frontend (e.g., in iframes).
6.  **API Authentication:** Requires a Bearer token (API Key) for API endpoints that interact with the code generation process.
7.  **Input Validation:** Performs basic validation on incoming API requests (API keys, seed prompts, folder names, model names).
8.  **Logging & Error Handling:** Includes request logging (using `morgan`) and basic error handling for API endpoints and server operations.

Within the provided project structure, `app.js` acts as the backend core, interacting with the frontend (`index.html`) and managing the state and files of generated projects stored in the `projects/` directory (which it creates if needed). It relies on `autocode-ai` (presumably installed globally or available via `bunx`) to perform the AI-driven code generation.

## Dependencies

*   `express`: Fast, unopinionated, minimalist web framework for Node.js.
*   `child_process`: Node.js module to spawn subprocesses (used here to run `autocode-ai` CLI).
*   `path`: Node.js module for working with file and directory paths.
*   `morgan`: HTTP request logger middleware for Node.js.
*   `url` (`fileURLToPath`): Helper to convert file URLs to path strings, necessary for `__dirname` in ES modules.
*   `fs/promises`: Node.js module for interacting with the file system using Promises.
*   `fs` (`existsSync`, `constants`): Used for synchronous existence checks and file system constants (like permissions).

## Configuration Constants

*   `__filename`: The absolute path to the current file (`app.js`).
*   `__dirname`: The absolute path to the directory containing the current file.
*   `projectsDir`: The absolute path to the directory where project subfolders will be created (defaults to `./projects/`).
*   `port`: The port the server listens on (defaults to `3000` or the value of the `PORT` environment variable).
*   `ALLOWED_MODELS`: An array of strings listing the valid model names accepted by the `/api/loop` endpoint for the `autocode-ai` tool.
*   `DEFAULT_MODEL`: The model name to use if the client doesn't specify one or provides an invalid one.

## Helper Functions

### `ensureProjectsDir()`

*   **Description:** Asynchronously checks if the `projectsDir` exists and is readable/writable by the application process. If the directory does not exist, it attempts to create it recursively. If the directory exists but lacks permissions, or if creation fails, it logs an error and terminates the application process (`process.exit(1)`).
*   **Parameters:** None.
*   **Returns:** `Promise<void>` - Resolves if the directory exists and is accessible (or is successfully created), otherwise logs an error and exits.
*   **Usage:** Called once during server startup to guarantee the project storage directory is ready before accepting requests.

### `runSingleIteration(folderPath, apiKey, modelName)`

*   **Description:** Executes a single iteration of the `autocode-ai` command-line tool within a specified project folder. It constructs the command, runs it as a child process, handles potential errors (including timeouts), and logs the execution status.
*   **Parameters:**
    *   `folderPath` (String): The absolute path to the project directory where the command should be executed.
    *   `apiKey` (String): The API key required by the `autocode-ai` tool.
    *   `modelName` (String): The name of the AI model to use for generation (validated against `ALLOWED_MODELS` before command execution, defaults to `DEFAULT_MODEL` if invalid).
*   **Returns:** `Promise<{ success: true, output: string }>` - Resolves with an object containing `success: true` and the trimmed standard output (`stdout`) of the CLI command upon successful execution.
*   **Rejects:** `Promise<Error>` - Rejects with an `Error` object if the command fails, times out, or encounters any other issue. The error message attempts to capture relevant details from `stderr`, `stdout`, or the error object itself.
*   **Notes:**
    *   The function includes a timeout (`executionTimeout`) to prevent hanging processes.
    *   It logs the command being executed (with the API key redacted).
    *   Input validation for `modelName` is performed as a defense-in-depth measure.

## Middleware

1.  **`express.json()`:** Parses incoming requests with JSON payloads (e.g., request bodies for POST endpoints) and makes them available under `req.body`.
2.  **`morgan('dev')`:** Logs HTTP requests to the console in a development-friendly format (e.g., `POST /api/loop 200 512.345 ms - 86`).
3.  **Root Static File Serving (`express.static(path.join(__dirname, '.'))`):** Serves static files (like `index.html`, `style.css`, `script.js` if present in the root) from the application's root directory (`__dirname`).
4.  **Project Static File Serving (`/projects`):**
    *   **Custom Security Middleware:** Intercepts requests to `/projects/*`. It decodes the requested path, normalizes it, and checks if the normalized path still resides within the `projectsDir`. This prevents path traversal attacks (e.g., `/projects/../app.js`). If a traversal attempt is detected, it sends a `403 Forbidden` response.
    *   **`express.static(projectsDir)`:** If the path is deemed safe by the custom middleware, this serves static files from the `projectsDir`. This allows accessing generated project files like `/projects/1678886400000/index.html`.

## API Endpoints

### `POST /api/kickoff`

*   **Description:** Initializes a new project session. It creates a unique directory for the project, saves the initial user prompt ("seed") into a `README.md` file within that directory, and creates placeholder `index.html`, `style.css`, and `script.js` files.
*   **Authentication:** Requires an `Authorization: Bearer <API_KEY>` header.
*   **Request Body:**
    ```json
    {
      "seed": "A description of the web component to build."
    }
    ```
    *   `seed` (String, required): The initial prompt or description for the project.
*   **Success Response (201 Created):**
    ```json
    {
      "folderName": "1678886400000" // Example timestamp-based folder name
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: If `seed` is missing or invalid.
    *   `401 Unauthorized`: If the `Authorization` header is missing, malformed, or the API key is invalid/empty.
    *   `500 Internal Server Error`: If directory/file creation fails.
*   **Example Usage (curl):**
    ```bash
    curl -X POST http://localhost:3000/api/kickoff \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -d '{ "seed": "Create a simple counter button." }'
    ```

### `POST /api/loop`

*   **Description:** Triggers a single code generation iteration using `autocode-ai` within an existing project folder identified by `folderName`. It uses the project's current `README.md` as input and modifies the project files (HTML, CSS, JS) based on the AI's output.
*   **Authentication:** Requires an `Authorization: Bearer <API_KEY>` header.
*   **Request Body:**
    ```json
    {
      "folderName": "1678886400000", // The unique identifier returned by /kickoff
      "model": "gemini-2.5-pro-exp-03-25" // Optional: Model name from ALLOWED_MODELS
    }
    ```
    *   `folderName` (String, required): The name of the project folder to run the iteration in.
    *   `model` (String, optional): The specific AI model to use. If omitted or invalid, `DEFAULT_MODEL` is used.
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Iteration completed successfully.",
      "cliOutput": "..." // Standard output from the autocode-ai CLI
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: If `folderName` is missing, invalid, or if the `autocode-ai` tool reports a user-related error (like safety blocks).
    *   `401 Unauthorized`: If the `Authorization` header is missing/invalid, or if `autocode-ai` reports an invalid API key.
    *   `403 Forbidden`: If the server lacks permissions to access the specified `folderName`.
    *   `404 Not Found`: If the specified `folderName` does not exist.
    *   `429 Too Many Requests`: If `autocode-ai` reports a rate limit error (e.g., `RESOURCE_EXHAUSTED`).
    *   `500 Internal Server Error`: If the `autocode-ai` command fails for other reasons (e.g., internal CLI error, script execution error) or if there's an issue accessing the folder.
    *   `504 Gateway Timeout`: If the `autocode-ai` command execution exceeds the defined timeout.
*   **Example Usage (curl):**
    ```bash
    curl -X POST http://localhost:3000/api/loop \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -d '{ "folderName": "1678886400000", "model": "gemini-2.0-flash-thinking-exp-01-21" }'
    ```

## Root Route (`GET /`)

*   **Description:** Serves the main `index.html` file located in the application's root directory. It includes a basic check using `req.accepts('html')` to ensure it primarily serves HTML to browsers, responding with a 404 for requests that don't accept HTML (like potentially misdirected API clients).
*   **Parameters:** None.
*   **Returns:** HTML content of `index.html` or a `404 Not Found` JSON response.

## Error Handling

1.  **API 404 Handler (`app.use('/api/*', ...)`):** Catches any requests made to paths starting with `/api/` that haven't been matched by the specific API endpoint routes (`/api/kickoff`, `/api/loop`). Responds with a `404 Not Found` JSON message.
2.  **Global Error Handler (`app.use((err, req, res, next) => ...)`):** A catch-all error handler for the Express application. It catches errors passed via `next(error)` from preceding middleware or route handlers. It logs the error to the console and sends a generic `500 Internal Server Error` JSON response (or uses `err.status` if available). In non-production environments, it might include the error message in the response for debugging.

## Server Initialization

1.  **`ensureProjectsDir()`:** Before starting the server, this function is called to ensure the `projects` directory exists and is accessible.
2.  **`app.listen(port, ...)`:** If `ensureProjectsDir` resolves successfully, the Express application starts listening for incoming connections on the configured `port`.
3.  **Console Logs:** Upon successful startup, the server logs messages indicating the listening address, the directories being served for static files (root and projects), and the allowed/default AI models.
4.  **Error Handling:** If `ensureProjectsDir` fails (e.g., permissions issues), the error is caught, logged, and the server process exits (`process.exit(1)`).

---