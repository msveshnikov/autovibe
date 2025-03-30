## AutoVibe - Sprint Plan - Sprint 1

**Date:** Sun Mar 30 2025 - Sat Apr 05 2025 (7 Days)

**Sprint Goal:** Develop a functional MVP of AutoVibe, enabling users to input a seed, provide their API key, and receive basic output from the thinking loop.

**Selected User Stories & Tasks:**

| ID    | Title                                      | Priority | Type    | Status   | Estimated Effort |
| :---- | :----------------------------------------- | :------- | :------ | :------- | :---------------- |
| NF-01 | **Implement Basic UI for Seed Input & Run** | [High]   | Feature | To Do    | 2 Story Points    |
| NF-02 | **Core "Thinking Loop" Logic in Backend**  | [High]   | Feature | To Do    | 5 Story Points    |
| NF-03 | **Display Basic Output to User**           | [High]   | Feature | To Do    | 2 Story Points    |
| NF-04 | **API Endpoint for Loop Execution (`/api/loop`)** | [High]   | Feature | To Do    | 3 Story Points    |
| NF-05 | **"Bring Your Own API Key" Functionality** | [High]   | Feature | To Do    | 5 Story Points    |
| NF-06 | **Basic Error Handling**                   | [High]   | Feature | To Do    | 3 Story Points    |
| NF-07 | **Loading State Indicators**               | [Medium] | Feature | To Do    | 2 Story Points    |

**Total Estimated Effort:** 22 Story Points

**Sprint Backlog Items Breakdown:**

1.  **NF-01: Implement Basic UI for Seed Input & Run (2 SP)**
    *   Create a simple form in `index.html` with:
        *   A text input field for the user to enter the "seed" idea.
        *   A button labeled "Run" or "Start" to initiate the loop.
    *   Basic styling to make the input and button visually clear.

2.  **NF-02: Core "Thinking Loop" Logic in Backend (5 SP)**
    *   Implement the core iterative logic in `app.js`.
        *   For this MVP, a simplified loop can be implemented. (Further clarification needed on "gemini 2.5 thinking" - for MVP, a placeholder iterative process can be used if details are not immediately available).
        *   The loop should take the seed as input and generate some iterative output (even if basic for now).
        *   Consider how to integrate with AutoCode CLI later, for now, a simplified internal process.

3.  **NF-03: Display Basic Output to User (2 SP)**
    *   Modify `app.js` to send the output from the "thinking loop" back to the frontend.
    *   In `index.html`, display the received output in a designated area (e.g., a `<div>`).
    *   Basic text display is sufficient for this sprint.

4.  **NF-04: API Endpoint for Loop Execution (`/api/loop`) (3 SP)**
    *   In `app.js`, create an Express route for `/api/loop`.
    *   This endpoint should:
        *   Receive the seed input from the frontend via a POST request.
        *   Trigger the "thinking loop" logic (NF-02).
        *   Send the output back to the frontend as a JSON response.

5.  **NF-05: "Bring Your Own API Key" Functionality (5 SP)**
    *   Add a new input field in `index.html` for users to input their API key.
    *   Modify the frontend JavaScript to send the API key along with the seed to the `/api/loop` endpoint.
    *   In `app.js`, receive the API key. For this sprint, focus on:
        *   Simply receiving and acknowledging the API key in the backend.
        *   **Security Consideration for Sprint 1:** For MVP, API key handling can be simplified (e.g., temporarily stored in memory during the loop execution). **Crucially, avoid storing or logging the API key persistently or insecurely.**  Proper secure handling will be addressed in later sprints.

6.  **NF-06: Basic Error Handling (3 SP)**
    *   Implement basic error handling in `app.js`:
        *   Try-catch blocks around the "thinking loop" execution.
        *   Handle potential errors during API key retrieval (even if simplified in this sprint).
        *   Send error messages back to the frontend as JSON responses.
    *   In `index.html`, display user-friendly error messages if the API request fails.

7.  **NF-07: Loading State Indicators (2 SP)**
    *   In `index.html`, implement a simple loading indicator (e.g., a spinner or text like "Processing...") that appears when the "Run" button is clicked and disappears when the output is displayed or an error occurs.
    *   Control the visibility of the loading indicator using JavaScript based on the API request lifecycle.

**Dependencies & Risks:**

*   **Dependency:** Frontend tasks (NF-01, NF-03, NF-07) are dependent on the backend API endpoint (NF-04) and core logic (NF-02) being in place. Backend tasks should be prioritized.
*   **Risk:**  Understanding and implementing the "thinking loop" logic (NF-02) might be more complex than initially estimated, potentially impacting the sprint timeline.  Start with a simplified iterative process for the MVP and iterate on complexity later.
*   **Risk:**  Even simplified API key handling (NF-05) requires careful consideration to avoid introducing security vulnerabilities, even in the MVP. Ensure no API keys are logged or stored insecurely.
*   **Risk:**  Basic error handling (NF-06) might not cover all edge cases. Focus on handling the most common error scenarios for the MVP and expand error handling in subsequent sprints.

**Definition of Done for Sprint 1:**

*   **Functional MVP:** Users can access `index.html`, input a seed and an API key, click "Run," and receive basic output displayed on the page.
*   **Basic UI Implemented:** Seed input field, API key input field, Run button, and output display area are functional and present in `index.html`.
*   **Core Loop Logic Implemented:** A simplified "thinking loop" (placeholder if needed for MVP) is running in `app.js` based on the seed.
*   **API Endpoint Functional:** The `/api/loop` endpoint in `app.js` is working and handles requests and responses.
*   **API Key Functionality:** Users can input an API key, and the backend can receive and acknowledge it (basic handling for MVP).
*   **Basic Error Handling:**  Basic error scenarios (e.g., backend errors during loop execution) are handled and displayed to the user.
*   **Loading Indicators:** Loading indicators are displayed during the processing time.
*   **Code Commit:** All code for the sprint is committed and pushed to the main branch.
*   **Sprint Demo:** The team demonstrates the functional MVP and verifies that the Definition of Done is met.