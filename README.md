# ThinkLoop - Project Documentation

## Project Overview

**ThinkLoop** is a web platform designed to empower users with rapid iterative thinking
capabilities. It enables users to explore ideas and generate unexpected outcomes at lightning speed
by running thousands of "gemini 2.5 thinking" iterations based on an initial seed input.

The platform containerizes the iterative process, offering a secure and consistent environment for
exploring concepts, refining ideas, and discovering novel solutions. Whether for brainstorming,
creative writing, or data pattern analysis, thinkloop.run provides the engine for rapid exploration
and idea generation.

![alt text](image.png)

# DEMO

https://thinkloop.run

**Key Goals:**

- **Containerization:** Ensure secure and consistent performance through isolated containers.
- **Bring your API key**: Get your own API key from [here](https://aistudio.google.com/apikey).
  Secure handling of API keys is paramount.
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
        - Managing containerization (potentially using libraries like `dockerode` or simpler process
          isolation) to run iterations securely.
        - Receiving the "seed" input and configuration from the frontend.
        - Executing iterations based on the seed and configured parameters.
        - Interfacing with external services or tools like the AutoCode CLI.
        - Generating and managing the output from the iterative processes.
        - Sending results back to the frontend (potentially via standard HTTP responses or
          WebSockets/SSE for real-time updates).
- **Frontend (`index.html`):**
    - A single HTML file, potentially including inline or linked CSS and JavaScript.
    - Provides the user interface for inputting the seed and initiating the loop.
    - Communicates with the backend API (`app.js`) to send requests and receive results.
    - Displays the generated outputs to the user.
- **Configuration (`package.json`, `.prettierrc`):**
    - `package.json`: Defines project metadata, dependencies (like Express, potentially WebSocket
      libraries, etc.), and scripts (e.g., `start`).
    - `.prettierrc`: Ensures consistent code formatting.
- **Database (Potential Future Addition):**
    - Currently not present in the structure.
    - Could be added later to store user data, iteration history, API keys securely, or manage job
      states if the application scales.

**Containerization:**

The backend (`app.js`) orchestrates container technology (like Docker) to run each "thinking loop"
or batches of iterations in isolated environments. This ensures:

- **Security:** Prevents processes from interfering with each other or the host system.
- **Consistency:** Provides a predictable environment for each run.
- **Resource Management:** Allows for better control over resource usage per loop.

## Module Interactions

1.  **User Interaction (Frontend - `index.html`):**

    - User loads `index.html` in their browser.
    - User inputs a "seed" and potentially configures parameters (e.g., iteration count) via form
      elements.
    - User clicks a "Run" button.
    - Client-side JavaScript captures the input and prepares an API request.

2.  **API Request (Frontend to Backend):**

    - Frontend JavaScript sends an asynchronous request (e.g., POST to `/api/loop`) to the backend
      (`app.js`), including the seed and configuration.

3.  **Processing Kick-off (Backend - `app.js`):**

    - `app.js` receives the request via its API endpoint.
    - It validates the input and initiates the thinking loop process asynchronously.
    - It may spawn a container or isolated process for the iterations.
    - It immediately responds to the frontend (e.g., with a job ID or acknowledgment) or keeps the
      connection open if using WebSockets/SSE.

4.  **Iterative Execution (Backend - Container/Process):**

    - The core logic runs iterations based on the seed within the isolated environment.
    - This might involve calls to external APIs (using the provided key), internal algorithms, or
      tools like AutoCode CLI.
    - Progress or intermediate results might be tracked.

5.  **Result Handling (Backend - `app.js`):**

    - `app.js` collects the final output once the iterations complete.
    - If using HTTP polling, it stores the result temporarily, associated with a job ID.
    - If using WebSockets/SSE, it pushes the results directly to the connected frontend client.

6.  **Output Display (Frontend - `index.html`):**
    - **Polling:** Frontend JavaScript periodically requests the result using the job ID until it's
      ready.
    - **WebSockets/SSE:** Frontend JavaScript listens for messages from the backend and updates the
      UI in real-time as results arrive.
    - The results are parsed and displayed dynamically within `index.html`.

## Usage Instructions - Getting Started

To start using thinkloop.run:

1.  **Access the Website:** Navigate to [http://thinkloop.run](http://thinkloop.run).
2.  **Input Your Seed:** Enter your initial idea, concept, or data into the provided input field on
    the main page (`index.html`).
3.  **Configure (Optional):** Adjust any available settings for the iteration process.
4.  **Run the Loop:** Click the "Run" or "Start" button. Observe any loading indicators.
5.  **Explore Output:** Wait for the results to appear. Explore the generated ideas and outcomes
    displayed on the page.
6.  **Iterate:** Refine your seed or settings based on the results and run the loop again.

## Installation (Local Development)

To set up the project for local development:

1.  **Prerequisites:**
    - Install [Node.js](https://nodejs.org/) (which includes npm).
    - Install [Docker](https://www.docker.com/get-started) if you intend to work with or test
      containerization features.
    - Optionally, install the [AutoCode CLI](https://autocode.work/) if needed for backend
      processes.
2.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
3.  **Install Dependencies:**
    ```bash
    npm install
    ```
4.  **Environment Variables:**
    - Create a `.env` file if needed for API keys or other configuration (ensure `.env` is listed in
      `.gitignore`).
    - Define necessary variables (e.g., `PORT`, potentially API keys if managed server-side).
5.  **Run the Application:**
    ```bash
    npm start
    # Or directly: node app.js
    ```
6.  **Access:** Open your web browser and navigate to `http://localhost:<PORT>` (e.g.,
    `http://localhost:3000`).

## Contributing

Contributions are welcomed! Please refer to the `CONTRIBUTING.md` file (to be created) for
guidelines on submitting bug reports, feature requests, and pull requests.

## License

License information will be provided upon release.

## Design Considerations & Future Development

### Current Structure Considerations (`index.html`, `app.js`)

- **Frontend Refactoring:** Split CSS and JavaScript out of `index.html` into separate `style.css`
  and `script.js` files for better organization and maintainability.
- **Backend Modularity:** As `app.js` grows, consider breaking down functionality into modules
  (e.g., `api.js`, `loop-runner.js`, `container-manager.js`).
- **State Management:** Currently, `app.js` likely manages loop state in memory. This won't persist
  across restarts or scale well. Consider:
    - Simple file-based storage for job status/results (for single-instance setups).
    - A lightweight database (like SQLite) or a key-value store (like Redis) for more robust state
      management if scaling is anticipated.

### UI/UX Enhancements (`index.html`, `script.js`, `style.css`)

- **Real-time Feedback:** Implement WebSockets or Server-Sent Events (SSE) for pushing progress
  updates and results from `app.js` to `index.html` instead of relying solely on polling.
- **Loading States:** Provide clear visual indicators (spinners, progress bars) in `index.html`
  while the backend is processing.
- **Result Visualization:** Improve how results are displayed. Consider cards, sortable lists,
  filters, or basic charting options depending on the output format.
- **Input Validation:** Add robust client-side (`script.js`) and server-side (`app.js`) validation
  for the seed input and configuration parameters.
- **Responsiveness:** Ensure the UI in `index.html` adapts gracefully to different screen sizes
  using CSS media queries.
- **Accessibility (A11y):** Continuously audit and improve `index.html` structure and ARIA
  attributes to meet WCAG standards.

### Backend & Architecture (`app.js`, Containerization)

- **API Design:** Formalize the API structure with clear endpoints, request/response formats (JSON),
  and HTTP status codes. Document the API (e.g., using OpenAPI/Swagger).
- **Asynchronous Handling:** Ensure long-running loop processes in `app.js` are handled
  asynchronously (e.g., using `async/await`, Promises, or potentially worker threads) to prevent
  blocking the main event loop.
- **Error Handling:** Implement comprehensive error handling in `app.js`, logging errors
  appropriately and sending user-friendly error messages to the frontend.
- **Configuration:** Allow more loop parameters (iteration count, model selection, etc.) to be
  configured via the API request. Manage configuration effectively (e.g., using environment
  variables or config files).
- **Security:**
    - Implement rate limiting on the API endpoints in `app.js`.
    - Sanitize all user inputs on the backend.
    - Carefully manage external API keys (like the Google AI key). Avoid storing them client-side.
      If used server-side, use environment variables or a secure secret management solution.
- **Scalability:** If expecting higher loads, plan for scaling `app.js` (e.g., using Node.js cluster
  module, process managers like PM2, or deploying multiple instances behind a load balancer). The
  containerization strategy also needs to support scaling.

### General & Operational

- **Testing:** Introduce testing strategies:
    - Unit tests for backend logic in `app.js`.
    - Integration tests for API endpoints.
    - End-to-end tests (e.g., using Playwright or Cypress) simulating user interaction.
- **Documentation:** Expand documentation, including API specifications and more detailed
  architecture diagrams.
- **CI/CD:** Set up a Continuous Integration/Continuous Deployment pipeline (e.g., using GitHub
  Actions) for automated testing and deployment.
- **Monitoring & Logging:** Implement logging in `app.js` (e.g., using Winston or Pino) and consider
  monitoring tools to track application performance and errors.

# TODO
