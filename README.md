# AutoVibe

**AutoVibe** is a free web platform designed to empower users with rapid iterative vibe coding
capabilities. It enables users to explore ideas and generate unexpected outcomes at lightning speed
by running thousands of LLM iterations based on an initial seed input.

The platform offers a secure and consistent environment for exploring concepts, refining ideas, and
discovering novel solutions. Whether for brainstorming, vibe coding, or data pattern analysis,
autovibe.dev provides the engine for rapid exploration and idea generation.

![alt text](image.png)

# PROD

https://autovibe.dev

**Key Goals:**

- **Bring your free API key**: Get your own free API key from
  [here](https://aistudio.google.com/apikey). Secure handling of API keys is paramount.
- **Seed-Based Creativity:** Allow users to guide the exploration with initial seed inputs.
- **Accessibility:** Offer a free core model for unrestricted exploration and adhere to WCAG
  guidelines.
- **Ease of Use:** Provide an intuitive and user-friendly interface.
- **Use AutoCode:** Leverage https://autocode.work/ in CLI mode for code generation tasks within the
  loop.

## Architecture Description

- **Backend (`app.js`):**
    - A single NodeJS application responsible for:
        - Serving the frontend (`index.html`).
        - Providing API endpoints (e.g., `/api/loop`) for the frontend.
        - Handling the core "thinking loop" process, including managing iterations.
        - Receiving the "seed" input and configuration from the frontend.
        - Executing iterations based on the seed and configured parameters.
        - Interfacing with external services or tools like the AutoCode CLI.
        - Generating and managing the output from the iterative processes.
        - Sending results back to the frontend via standard HTTP responses.
    - ALLOWED_MODELS
        - 'gemini-2.0-flash-thinking-exp-01-21', // Default/Fast
        - 'gemini-2.5-pro-exp-03-25' // Better/Slower
- **Frontend (`index.html`):**
    - A single HTML file, including inline or linked CSS and JavaScript.
    - Provides the user interface for inputting the seed and initiating the loop.
    - Communicates with the backend API (`app.js`) to send requests and receive results.
    - Displays the generated html and markdown outputs to the user.
- **File system storage**
    - Each user session created new folder on server
    - AutoCode CLI is run inside this folder iteratively.

## Module Interactions

1.  **User Interaction (Frontend - `index.html`):**

    - User loads `index.html` in their browser.
    - User inputs a "seed".
    - User clicks a "Run" button.
    - Client-side JavaScript captures the input and prepares an API request.

2.  **API Request (Frontend to Backend):**

    - Frontend JavaScript sends an asynchronous request (e.g., POST to `/api/kickoff`) to the
      backend (`app.js`), including the seed.

3.  **Processing Kick-off (Backend - `app.js`):**

    - `app.js` receives the request via its API endpoint.
    - It validates the input and initiates the thinking loop process asynchronously returns unique
      folder name (e.g., `autovibe.dev/${unixTimestamp}`).
    - It creates a unique folder on the server (inside ./projects) to store the seed to README.md.
    - It creates empty index.html file in the same folder, as well as style.css and script.js files.
    - It immediately responds to the frontend (e.g., with a unique folder name).
    - Frontend show content of this folder to user in iframes (README.md and index.html, side by
      side).

4.  **Iterative Execution (Backend - Container/Process):**

    - The frontend logic runs iterations.
    - Each iteration is executed in `/api/loop`
    - The backend (`app.js`) handles the loop logic, including:
        - Generating new ideas or outputs based on the seed.
        - Executing the AutoCode CLI command to generate code or content.
        - Updating the unique folder with new results.
    - This involve calls to external CLI (AutoCode, using the provided key).
    - AutoCode updates README.md and index.html files in the unique folder.
    - Progress or intermediate results are shown in the same iframes (folder keeps the same!)

5.  **Output Display (Frontend - `index.html`):**
    - **Polling:** Frontend refreshes iframes after call to `/api/loop`.
    - The results are parsed and displayed to user.
    - Iterations number is shown on the page, with spinner indicating thenext iterations is running.
    - User can view the generated ideas, code, or content in the iframe.
    - User can interact with the index.html iframe
    - User can terminate thinking loop by clicking big red "Stop" button.

## Usage Instructions - Getting Started

To start using autovibe.dev:

1.  **Access the Website:** Navigate to [https://autovibe.dev](https://autovibe.dev).
2.  **Configure API key:** Enter it in the provided field.
3.  **Input Your Seed:** Enter your initial idea, concept, or data into the provided input field on
    the main page (`index.html`).
4.  **Run the Loop:** Click the "Run" or "Start" button. Observe any loading indicators.
5.  **Explore Output:** Wait for the results to appear. Explore the generated ideas and outcomes
    displayed on the page.
6.  **Stop:** If you want to stop the process, click the "Stop" button. The loop will terminate, and
    you can review and download the results generated up to that point.
7.  **Share** your results with others or use them for further exploration.

## Installation (Local Development)

To set up the project for local development:

1.  **Prerequisites:**
    - Install [Bun.sh](https://bun.sh/) (or Node.js if you prefer).
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

5.  **Access:** Open your web browser and navigate to `http://localhost:3000`.

## Design Ideas and Considerations

This section outlines potential improvements and future directions for AutoVibe:

**User Interface & Experience (UI/UX):**

- **Enhanced Progress Visualization:** Implement a more informative progress indicator showing the
  current iteration number, total planned iterations (if applicable), and potentially estimated time
  remaining.
- **Iteration History & Management:** Allow users to browse through the history of generated
  `README.md` and `index.html` versions, select specific ones, compare them, and download archives
  of specific iteration states.
- **Advanced Configuration:** Provide a dedicated settings panel for users to fine-tune parameters
  like LLM temperature, max tokens, and specific AutoCode CLI flags before starting a loop.
- **Improved Error Feedback:** Display errors from the backend loop or AutoCode CLI directly in the
  UI, providing clearer context than just failed requests.
- **Responsive Design:** Ensure the interface adapts cleanly to various screen sizes, including
  mobile devices.

**Backend & Architecture:**

- **Database Integration:** Consider replacing file-system storage for session data and results with
  a database (e.g., MongoDB) for better querying, persistence, and management, especially if user
  accounts or saved sessions are introduced.
- **State Management:** Implement more explicit state management for each running loop (e.g.,
  `pending`, `running`, `completed`, `failed`, `stopped`) tracked in the backend.

**Feature Enhancements:**

- **LLM Model Selection:** Allow users to select from different compatible LLMs via the UI,
  potentially requiring different API keys or configurations.
- **Seed Templates:** Offer pre-defined seed examples or templates for common use cases (e.g.,
  landing page generation, component design, documentation writing) to help users get started.
- **Session Persistence:** Explore options for users to save their sessions (seed, configuration,
  generated results) and resume them later (likely requires user authentication).

**Operational:**

- **Monitoring & Logging:** Integrate comprehensive logging and monitoring tools (e.g., Prometheus,
  Grafana, Sentry) to track application health, performance, and errors.
- **CI/CD Pipeline:** Establish automated testing and deployment pipelines using tools compatible
  with the project structure (e.g., GitHub Actions) to streamline development and ensure code
  quality.

## Contributing

Contributions are welcomed! Please refer to the `CONTRIBUTING.md` file for guidelines on submitting
bug reports, feature requests, and pull requests.

## License

MIT

# TODO

- add "open in new tab" button to html iframe
