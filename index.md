# Documentation for `index.html`

## Overview

The `index.html` file serves as the main entry point and landing page for autovibe.dev, a web
application designed to facilitate AI-powered iterative coding and creative content generation. This
single-page application allows users to define an initial idea (seed), select an AI model, and
initiate an iterative loop. The system then leverages the chosen AI model (via API calls, using the
user's provided API key) to generate and refine content in a series of iterations. Users can preview
the generated outputs (README and HTML) in real-time and stop the loop at any point.

This file is the frontend of the application, built with HTML, CSS, and JavaScript. It provides the
user interface for interacting with the backend services responsible for running the AI iterations.

**Project Structure Context:**

Within the project structure, `index.html` resides at the root level, indicating its primary role as
the application's entry point. It works in conjunction with backend components (likely implemented
in `app.js` and containerized using Docker as suggested by `Dockerfile` and `docker-compose.yml`) to
deliver the full functionality of autovibe.dev. The `docs` directory in the project structure
suggests that documentation is a key aspect of this project, aligning with the purpose of this
document.

## File Structure (HTML)

The `index.html` file is structured into the following key sections:

- **`<!doctype html>` and `<html lang="en">`**: Standard HTML5 document declaration and language
  attribute, setting the document type to HTML5 and the language to English.

- **`<head>`**: Contains meta-information about the HTML document, which is not displayed on the
  page itself.

    - **Meta Tags**:
        - `charset="UTF-8"`: Specifies character encoding for the document.
        - `viewport`: Configures the viewport for responsive design across different devices.
        - `description`: Provides a brief summary of the website's content for search engines.
        - `keywords`: Lists relevant keywords for search engine optimization (SEO).
        - `canonical`: Defines the preferred URL for the page to avoid duplicate content issues.
        - **Open Graph (`og:`) tags**: Meta tags for social media sharing, controlling how the page
          appears when shared on platforms like Facebook. Includes `title`, `description`, `type`,
          `url`, `image`, and `site_name`.
        - **Twitter Card (`twitter:`) tags**: Similar to Open Graph, but specifically for Twitter,
          controlling how the page is displayed in tweets. Includes `card`, `title`, `description`,
          `image`, `site`, and `creator`.
    - **`<title>`**: Sets the title that appears in the browser tab or window title bar:
      "autovibe.dev - AI-Powered Iterative Coding & Creativity".
    - **`<link>` tags**:
        - `rel="canonical"`: Specifies the canonical URL for SEO.
        - `rel="icon"`: Links to the favicon (browser tab icon).
        - `rel="apple-touch-icon"`: Links to the icon used for Apple touch devices.
        - `href` to Google Fonts (Poppins): Imports the Poppins font for styling.
        - `rel="stylesheet"` to Font Awesome CDN: Links to Font Awesome icons.
        - `rel="manifest"`: Links to `site.webmanifest` for Progressive Web App (PWA) functionality.
    - **`<script>` tags**:
        - `src` to `marked.min.js` CDN: Includes the Marked.js library for parsing Markdown to HTML.
        - Google Analytics script: Implements Google Analytics tracking for website usage
          statistics.
    - **`<style>`**: Contains inline CSS styles to define the visual appearance of the page.

- **`<body>`**: Contains the visible content of the HTML document.

    - **`<div class="background-animation">`**: Creates an animated background effect using CSS
      circles.
    - **`<header id="header">`**: The website header, fixed to the top of the viewport.
        - **`<div class="container">`**: Container to limit content width and center it on larger
          screens.
        - **`<div class="header-inner">`**: Inner container for header elements, using flexbox for
          layout.
            - **`<a href="#" class="logo">`**: Website logo, linking to the homepage (currently
              `#`). Includes a Font Awesome brain icon and the text "AutoVibe".
            - **`<button class="mobile-menu-btn" id="mobile-menu-btn">`**: Button to toggle the
              mobile navigation menu, visible on smaller screens.
            - **`<nav id="nav" aria-label="Main Navigation">`**: Navigation menu.
                - **`<ul>`**: Unordered list containing navigation links.
                    - `<li><a href="#features">Features</a></li>` - Links to the Features section.
                    - `<li><a href="#how-it-works">How it Works</a></li>` - Links to the How it
                      Works section.
                    - `<li><a href="#loop-input-section">Start Loop</a></li>` - Links to the Start
                      Loop section.
                    - `<li><a href="#api-key">API Key</a></li>` - Links to the API Key section.
                    - `<li><a href="#results-section">Previews</a></li>` - Links to the Previews
                      section.
                    - `<li><a href="https://github.com/msveshnikov/autovibe" class="secondary-button">GitHub</a></li>` -
                      Link to the project's GitHub repository, styled as a secondary button.
    - **`<main>`**: The main content area of the page.
        - **`<section class="hero">`**: Hero section, the initial visual section of the page.
            - **`<div class="container">`**: Container for content limiting and centering.
            - **`<div class="hero-content">`**: Inner container for hero content.
                - **`<h1 id="hero-title" class="hero-title">`**: Main heading of the hero section:
                  "Unleash Iterative Creativity".
                - **`<p class="hero-subtitle">`**: Subtitle providing a description of AutoVibe's
                  functionality.
                - **`<a href="#loop-input-section" class="cta-button">`**: Call to action button,
                  linking to the "Start Loop" section.
        - **`<section class="features" id="features">`**: Features section, highlighting key
          capabilities.
            - **`<div class="container">`**: Container for content limiting and centering.
            - **`<h2 id="features-title" class="section-title">`**: Section title: "Powerful
              Features".
            - **`<div class="features-grid">`**: Grid layout to display feature items.
                - **`<article class="feature-item">`**: Individual feature items, each containing an
                  icon, title, and description. (Repeated for multiple features).
        - **`<section class="how-it-works" id="how-it-works">`**: Section explaining how AutoVibe
          works in steps.
            - **`<div class="container">`**: Container for content limiting and centering.
            - **`<h2 id="how-it-works-title" class="section-title">`**: Section title: "How AutoVibe
              Works".
            - **`<div class="how-it-works-steps">`**: Container for steps, laid out horizontally.
                - **`<article class="step-item">`**: Individual step items, each with a step number,
                  title, and description. (Repeated for multiple steps).
        - **`<section class="loop-input-section" id="loop-input-section">`**: Section containing the
          form to start the iterative loop.
            - **`<div class="container">`**: Container for content limiting and centering.
            - **`<h2 id="loop-input-title" class="section-title">`**: Section title: "Start Your
              Loop".
            - **`<div class="loop-form">`**: Form container.
                - **`<form id="loop-form">`**: Form element for user input.
                    - **`<div class="form-group">`**: Form groups for each input field.
                        - **`<label for="seed-input" class="form-label">`**: Label for the "Seed
                          Input" textarea.
                        - **`<textarea id="seed-input" class="form-textarea">`**: Textarea for the
                          user to enter their seed idea.
                        - **`<p id="seed-help" class="form-help">`**: Help text for the seed input.
                    - **`<div class="form-group">`**: Form group for model selection.
                        - **`<label for="model-select" class="form-label">`**: Label for the "Model
                          Select" dropdown.
                        - **`<select id="model-select" class="form-select">`**: Dropdown select for
                          choosing the AI model. Contains `<option>` elements for different models.
                        - **`<p id="model-help" class="form-help">`**: Help text for model
                          selection.
                    - **`<button type="submit" id="run-loop-btn" class="cta-button">`**: Button to
                      start the loop.
                    - **`<button type="button" id="stop-loop-btn" class="cta-button">`**: Button to
                      stop the loop (initially hidden).
                    - **`<div class="status-container">`**: Container for status messages and
                      iteration count.
                        - **`<div id="status-message" class="status-message">`**: Div to display
                          status messages (e.g., "Loading...", "Error...").
                        - **`<div id="iteration-status" class="iteration-status">`**: Div to display
                          iteration status.
                            - **`<div id="spinner" class="spinner">`**: Spinner animation shown
                              during iterations.
                            - **`<span id="iteration-counter">`**: Span to display the current
                              iteration number.
        - **`<section class="results-section" id="results-section">`**: Section to display live
          previews of generated content.
            - **`<div class="container">`**: Container for content limiting and centering.
            - **`<h2 id="results-title" class="section-title">`**: Section title: "Live Previews".
            - **`<div class="iframe-container">`**: Container for iframes, arranged in a flexible
              layout.
                - **`<div class="iframe-wrapper">`**: Wrapper for each iframe and its related
                  controls.
                    - **`<iframe id="readme-preview" class="result-preview-iframe-readme">`**:
                      Iframe to display the preview of `README.md`.
                - **`<div class="iframe-wrapper">`**: Wrapper for HTML preview iframe and share
                  buttons.
                    - **`<iframe id="html-preview" class="result-preview-iframe">`**: Iframe to
                      display the preview of `index.html`.
                    - **`<div class="share-button-container">`**: Container for share buttons.
                        - **`<button id="share-btn" class="share-button">`**: Button to copy the
                          project link to the clipboard.
                        - **`<button id="open-html-btn" class="share-button">`**: Button to open the
                          generated HTML in a new tab.
                        - **`<span id="share-feedback">`**: Span to display feedback messages
                          related to sharing.
            - **`<p>`**: Paragraph below the previews providing additional information.
        - **`<section class="api-key-section" id="api-key">`**: Section for managing the Google AI
          API key.
            - **`<div class="container">`**: Container for content limiting and centering.
            - **`<h2 id="api-key-title" class="section-title">`**: Section title: "Manage API Key".
            - **`<div class="api-form">`**: Form container for API key input.
                - **`<div class="form-group">`**: Form group for API key input.
                    - **`<label for="api-key-input" class="form-label">`**: Label for the API key
                      input.
                    - **`<input type="password" id="api-key-input" class="form-input">`**: Input
                      field (password type for security) for the user to paste their API key.
                    - **`<p id="api-key-help" class="form-help">`**: Help text explaining where to
                      get the API key and how it's stored.
                - **`<button id="save-api-key-btn" class="cta-button">`**: Button to save the API
                  key.
                - **`<div id="api-key-status" class="status-message">`**: Div to display status
                  messages related to API key saving.
        - **`<section class="cta-section">`**: Call to action section at the end of the main
          content.
            - **`<div class="container">`**: Container for content limiting and centering.
            - **`<div class="cta-content">`**: Inner container for CTA content.
                - **`<h2 id="cta-title" class="cta-title">`**: Section title: "Ready to Explore?".
                - **`<p class="cta-subtitle">`**: Subtitle encouraging users to take action.
                - **`<div class="cta-buttons">`**: Container for CTA buttons.
                    - **`<a href="#loop-input-section" class="cta-button">`**: Primary CTA button to
                      start looping.
                    - **`<a href="https://github.com/msveshnikov/autovibe#installation-local-development" class="secondary-button">`**:
                      Secondary CTA button linking to the setup guide on GitHub.
    - **`<footer>`**: Website footer.
        - **`<div class="container">`**: Container for content limiting and centering.
        - **`<div class="footer-content">`**: Container for footer columns.
            - **`<div class="footer-column">`**: Column for logo and description.
                - **`<a href="#" class="footer-logo">`**: Footer logo, linking to the homepage.
                - **`<p class="footer-description">`**: Description of AutoVibe.
                - **`<div class="social-links">`**: Container for social media links.
                    - **`<a href="https://github.com/msveshnikov/autovibe" class="social-link">`**:
                      Link to the GitHub repository.
            - **`<div class="footer-column">`**: Column for quick links.
                - **`<h4 class="footer-title">`**: Title: "Quick Links".
                - **`<ul class="footer-links">`**: Unordered list for quick navigation links.
            - **`<div class="footer-column">`**: Column for resources.
                - **`<h4 class="footer-title">`**: Title: "Resources".
                - **`<ul class="footer-links">`**: Unordered list for resource links.
        - **`<div class="footer-bottom">`**: Bottom part of the footer for copyright information.

- **`<script>` (at the end of `body`)**: Contains inline JavaScript code for client-side application
  logic.

## Functionality (JavaScript)

The JavaScript code within `index.html` is responsible for the dynamic behavior of the webpage and
interaction with the backend API. It can be categorized into the following functionalities:

**1. Initialization and Setup:**

- **`DOMContentLoaded` event listener**: Executes code after the HTML document is fully loaded and
  parsed.
- **Constants**: Defines `API_KEY_STORAGE_KEY` and `MODEL_STORAGE_KEY` for local storage keys.
- **DOM Element Selectors**: Uses `document.getElementById` to cache references to frequently used
  HTML elements for performance.
- **State Variables**:
    - `isLoopRunning`: Boolean flag to track if the iterative loop is currently running.
    - `currentfolderName`: Stores the name of the project folder generated on the server.
    - `currentIteration`: Tracks the current iteration number of the loop.
    - `loopTimeoutId`: Stores the ID of the `setTimeout` function used for iterative looping.
- **Initial UI State**:
    - Sets the copyright year in the footer dynamically.
    - Calls `loadApiKey()` and `loadSelectedModel()` to retrieve saved API key and model preference
      from local storage.
    - Hides the stop loop button and iteration status elements initially.
    - Disables share and open HTML buttons until iterations are run.
    - Calls `resetPreviews()` to clear iframe previews.

**2. Event Handling:**

- **Scroll Event (`window.addEventListener('scroll', ...)`):**

    - Adds or removes the `scrolled` class to the header element based on the vertical scroll
      position. This is used to implement a sticky header effect with a shadow when scrolling down.

- **Mobile Menu Button Click Event (`mobileMenuBtn.addEventListener('click', ...)`):**

    - Toggles the `active` class on the navigation (`<nav>`) element to show/hide the mobile
      navigation menu.
    - Updates the `aria-expanded` attribute for accessibility.

- **Navigation Link Click Events (`nav.querySelectorAll('a').forEach((link) => { ... })`):**

    - Handles clicks on navigation links within the header.
    - For in-page links (starting with `#`):
        - Prevents default link behavior.
        - Smooth scrolls to the target section using `scrollIntoView({ behavior: 'smooth' })`.
        - Sets focus to the target section or the first focusable element within it for
          accessibility.
        - If the mobile menu is active, it closes the menu and focuses back on the mobile menu
          button.
    - For external links or links that don't start with `#`, it closes the mobile menu if it's
      active.

- **Save API Key Button Click and API Key Input Keypress Events
  (`saveApiKeyBtn.addEventListener('click', ...)` and
  `apiKeyInput.addEventListener('keypress', ...)`):**

    - Calls the `saveApiKey()` function when the "Save API Key" button is clicked or when Enter key
      is pressed in the API key input field.

- **Model Select Change Event (`modelSelect.addEventListener('change', ...)`):**

    - Calls the `saveSelectedModel()` function when the selected AI model in the dropdown changes.

- **Loop Form Submit Event (`loopForm.addEventListener('submit', ...)`):**

    - Calls the `handleKickoff()` function when the loop form is submitted.
    - Prevents default form submission behavior.

- **Stop Loop Button Click Event (`stopLoopBtn.addEventListener('click', ...)`):**

    - Calls the `stopLoop()` function when the "Stop Loop" button is clicked.

- **Share Button Click Event (`shareBtn.addEventListener('click', ...)`):**

    - Calls the `handleShare()` function when the "Share Project Link" button is clicked.

- **Open HTML Button Click Event (`openHtmlBtn.addEventListener('click', ...)`):**
    - Calls the `handleOpenHtml()` function when the "Open HTML" button is clicked.

**3. Functions:**

- **`loadApiKey()`**:

    - Retrieves the API key from local storage using `API_KEY_STORAGE_KEY`.
    - If found, populates the `apiKeyInput` field and displays a success status message.
    - If not found, displays an info status message prompting the user to enter and save an API key.

- **`saveApiKey()`**:

    - Gets the API key value from `apiKeyInput`, trims whitespace.
    - If the key is not empty, saves it to local storage using `API_KEY_STORAGE_KEY` and displays a
      success status message.
    - If the key is empty, removes the API key from local storage and displays an info message
      indicating removal.

- **`loadSelectedModel()`**:

    - Retrieves the selected model from local storage using `MODEL_STORAGE_KEY`.
    - If found and the model exists in the `modelSelect` options, sets the dropdown value to the
      stored model and logs a console message.
    - If the stored model is not found in the options (possibly due to model updates), removes the
      stored model from local storage and logs a warning.

- **`saveSelectedModel()`**:

    - Gets the selected model value from `modelSelect`.
    - If a model is selected, saves it to local storage using `MODEL_STORAGE_KEY` and logs a console
      message.

- **`displayApiKeyStatus(message, type = 'info')`**:

    - Updates the text content of the `apiKeyStatus` element with the provided `message`.
    - Sets the CSS class of `apiKeyStatus` to `status-message` and the provided `type` (e.g.,
      'success', 'info', 'error') for styling.
    - Makes the `apiKeyStatus` element visible.

- **`displayStatus(message, type = 'info')`**:

    - Similar to `displayApiKeyStatus`, but updates the `statusMessage` element for general status
      updates during loop execution.

- **`clearStatus()`**:

    - Clears the text content and hides the `statusMessage` element.

- **`resetPreviews()`**:

    - Sets the `src` attribute of `htmlPreviewIframe` to `about:blank` to clear the HTML preview.

- **`updateResultPreviews(folderName, iterationNumber)`**:

    - Updates the iframe previews with content from the specified iteration.
    - Constructs URLs for `README.md` and `index.html` files based on `folderName` and
      `iterationNumber`, adding a cache-busting query parameter.
    - Sets the `src` of `htmlPreviewIframe` to the generated HTML URL.
    - Fetches `README.md` content, parses it as Markdown using `marked.parse()`, and sets the
      `srcdoc` of `readmePreviewIframe` to display the rendered HTML.
    - Handles potential errors during fetching or rendering and displays error messages in the
      iframes.
    - Enables `shareBtn` and `openHtmlBtn` after successful preview update.

- **`handleKickoff(event)`**:

    - Triggered when the loop form is submitted.
    - Prevents form submission, checks if a loop is already running, and clears any existing
      timeouts, statuses, and previews.
    - Retrieves seed input, API key (from local storage), and selected model.
    - Performs input validation: checks for missing API key, seed, or model selection. Displays
      error messages if necessary and focuses on the invalid input field.
    - If inputs are valid, displays a "Kicking off the loop..." loading status.
    - Disables the "Run Vibing Loop" button, shows and enables the "Stop Loop" button, and hides
      iteration status elements.
    - Sets `isLoopRunning` to `true`, resets iteration counter, and clears `currentfolderName`.
    - Makes an asynchronous `fetch` request to the `/api/kickoff` endpoint (backend) with the seed
      and selected model, including the API key in the `Authorization` header.
    - Handles successful and error responses from the `/api/kickoff` endpoint:
        - **Success**: Parses the JSON response, extracts `folderName` and `initialIteration`,
          updates state variables, displays iteration status, updates previews, scrolls to the
          results section, and initiates the iterative loop by calling `runIteration()`.
        - **Error**: Handles different types of errors (Response errors, parsing errors, generic
          errors), displays appropriate error messages using
          `displayStatus('errorMessage', 'error')`, and calls `stopLoop()`.

- **`runIteration()`**:

    - Executes a single iteration of the AI loop.
    - Checks if `isLoopRunning` is still true and if `currentfolderName` is available. If not, stops
      the loop and returns.
    - Increments `currentIteration`, updates the iteration counter display, shows iteration status
      elements, displays a "Running iteration..." loading status, and clears share feedback.
    - Retrieves API key and selected model from local storage.
    - Performs validation: checks for missing API key or model. If missing, displays an error and
      calls `stopLoop()`.
    - Makes an asynchronous `fetch` request to the `/api/loop` endpoint (backend) with `folderName`,
      selected model, and iteration number, including the API key in the `Authorization` header.
    - Handles successful and error responses from the `/api/loop` endpoint:
        - **Success**: Parses the JSON response, extracts `iteration` number, updates
          `currentIteration`, displays a success status message ("Iteration finished. Updating
          previews..."), updates previews using `updateResultPreviews()`. If `isLoopRunning` is
          still true, sets a `setTimeout` to call `runIteration()` again after a 500ms delay for the
          next iteration. If `isLoopRunning` is false, calls `stopLoop()`.
        - **Error**: Handles different types of errors (Response errors, parsing errors, generic
          errors), displays appropriate error messages using
          `displayStatus('errorMessage', 'error')`, and calls `stopLoop()`. In case of HTTP errors,
          attempts to provide more specific error messages based on the status code (e.g., API key
          issues, rate limits, timeouts).
    - In the `finally` block, hides the spinner if the loop is not running anymore.

- **`stopLoop()`**:

    - Stops the iterative loop.
    - Sets `isLoopRunning` to `false`.
    - Clears any pending `setTimeout` using `clearTimeout(loopTimeoutId)`.
    - Re-enables the "Run Vibing Loop" button, disables and hides the "Stop Loop" button, and hides
      the spinner.
    - Hides share feedback.
    - If the loop was running and a project folder and iterations exist:
        - If no error status is active, displays an info status message ("Loop stopped...").
        - Updates the iteration counter display.
        - Shows iteration status elements.
        - Enables share and open HTML buttons.
    - In other scenarios (no project folder or iterations, or error status active):
        - Clears general status messages (unless an error status is already displayed).
        - Hides iteration status elements.
        - Disables share and open HTML buttons.
        - Resets previews.
    - Logs "Loop stopped." to the console.

- **`handleShare()`**:

    - Triggered when the "Share Project Link" button is clicked.
    - Checks if `currentfolderName` is available, the share button is not disabled, and iterations
      have been run. If not, returns without action.
    - Constructs the project URL based on `window.location.origin`, `currentfolderName`, and
      `currentIteration`.
    - Uses `navigator.clipboard.writeText()` to copy the project URL to the user's clipboard.
    - Displays a success feedback message ("Link copied!") or an error feedback message ("Copy
      failed!") in the `shareFeedback` span, with a timeout to hide the feedback after 2 seconds.
      Handles potential errors during clipboard writing.

- **`handleOpenHtml()`**:
    - Triggered when the "Open HTML" button is clicked.
    - Checks if `currentfolderName` is available, iterations have been run, and the open HTML button
      is not disabled. If not, returns without action.
    - Constructs the HTML URL based on `currentfolderName` and `currentIteration`.
    - Opens the HTML URL in a new browser tab using `window.open(htmlUrl, '_blank')`.

## Styles (CSS)

The inline `<style>` block in `index.html` defines the CSS rules to style the webpage. Key aspects
of the styling include:

- **CSS Variables (`:root`)**: Defines a set of CSS variables for theming, allowing for easy
  customization and consistency of colors and styles across the website. Variables are defined for
  primary, secondary, dark, light, text, error, and success colors.
- **Reset Styles (`*`)**: Basic reset rules to remove default margins and padding, and set
  `box-sizing: border-box` for consistent box model calculations.
- **Body Styles (`body`)**: Sets the default font family (Poppins), text color, background color
  (dark mode), overflow behavior, and line height.
- **Container (`.container`)**: Defines a container class to limit the maximum width of content on
  larger screens and center it horizontally.
- **Header (`header`)**: Styles the header element for fixed positioning at the top, padding,
  z-index, transition for scrolling effect, background color with transparency, and backdrop filter
  for blur effect. Includes styles for scrolled state (adding box-shadow).
- **Logo (`.logo`)**: Styles the website logo with font size, font weight, primary color, no text
  decoration, and flexbox layout for icon alignment.
- **Navigation (`nav`)**: Styles the navigation menu, including list styles, flexbox for horizontal
  layout (desktop), and styles for mobile menu behavior (hidden by default, shown with `active`
  class, transitions).
- **Hero Section (`.hero`)**: Styles the hero section with relative positioning, text alignment,
  padding, and overflow hidden.
- **Hero Content (`.hero-content`)**: Styles the hero content container with relative positioning,
  z-index, and max-width.
- **Hero Title (`.hero-title`)**: Styles the main hero title with font size, font weight, margin,
  gradient text color, and animation (`titleFade`).
- **Hero Subtitle (`.hero-subtitle`)**: Styles the hero subtitle with font size, text color, margin,
  animation (`subtitleFade`).
- **CTA Buttons (`.cta-button`, `.secondary-button`)**: Styles call-to-action buttons with
  inline-block display, padding, font size, font weight, text decoration, text color, background
  gradients (for primary button), border-radius, transitions, box-shadow, positioning, overflow
  hidden, animations (`buttonFade`), and hover effects (transform, box-shadow, ripple effect using
  `::after` pseudo-element). Includes styles for disabled state.
- **Section Titles (`.section-title`)**: Styles section titles with font size, font weight, text
  alignment, margin, relative positioning, color, and a decorative underline using `::after`
  pseudo-element with gradient background.
- **Features Section (`.features`)**: Styles the features section with padding, background color,
  and relative positioning.
- **Features Grid (`.features-grid`)**: Styles the grid layout for feature items using CSS Grid.
- **Feature Item (`.feature-item`)**: Styles individual feature items with padding, background
  color, border-radius, text alignment, transitions, relative positioning, overflow hidden,
  box-shadow, and a subtle gradient overlay on hover using `::before` pseudo-element.
- **Feature Icon (`.feature-icon`)**: Styles feature icons with font size, margin, inline-block
  display, gradient text color.
- **Feature Title (`.feature-title`)**: Styles feature titles with font size, font weight, margin,
  and color.
- **Feature Description (`.feature-description`)**: Styles feature descriptions with text color and
  line height.
- **How It Works Section (`.how-it-works`)**: Styles the how-it-works section with padding and
  relative positioning.
- **How It Works Steps (`.how-it-works-steps`)**: Styles the container for steps, using flexbox for
  horizontal layout and wrapping, margin, and relative positioning. Includes a connecting line
  between steps using `::before` pseudo-element with gradient background (hidden on smaller
  screens).
- **Step Item (`.step-item`)**: Styles individual step items with flex basis, min/max width, margin,
  relative positioning, z-index, and text alignment.
- **Step Number (`.step-number`)**: Styles step number circles with width, height, border-radius,
  gradient background, text color, font size, font weight, flexbox layout for centering, margin, and
  box-shadow.
- **Step Title (`.step-title`)**: Styles step titles with font size, font weight, margin, and color.
- **Step Description (`.step-description`)**: Styles step descriptions with text color and line
  height.
- **Loop Input Section (`.loop-input-section`)**: Styles the loop input section with padding and
  background color.
- **Loop Form (`.loop-form`)**: Styles the loop form container with max-width, margin, padding,
  background color, border-radius, and box-shadow.
- **Form Group (`.form-group`)**: Styles form groups with margin and text alignment.
- **Form Label (`.form-label`)**: Styles form labels with display block, margin, font weight, and
  color.
- **Form Inputs, Textareas, Selects (`.form-input`, `.form-textarea`, `.form-select`)**: Styles form
  input elements with width, padding, font size, background color, border, border-radius, color,
  transitions, font family, and focus styles (outline, border color, box-shadow). Styles textarea
  for resizing and min-height. Styles select dropdown with appearance reset, background image for
  dropdown arrow, padding, and option styles.
- **Form Help Text (`.form-help`)**: Styles form help text with font size and text color.
- **Status Container (`.status-container`)**: Styles the container for status messages and iteration
  status, using flexbox, alignment, gap, margin, and flex wrap.
- **Status Message (`.status-message`)**: Styles status messages with padding, border-radius, font
  weight, flex grow, text alignment, min-width, and specific styles for different status types
  (`.error`, `.success`, `.loading`, `.info`) using background color and text color.
- **Iteration Status (`.iteration-status`)**: Styles the iteration status container with flexbox,
  alignment, gap, font weight, text color, and flex shrink.
- **Spinner (`.spinner`)**: Styles the spinner animation with width, height, border, border-top
  color, border-radius, animation (`spin`), and initial display set to none.
- **Results Section (`.results-section`)**: Styles the results section with padding.
- **Iframe Wrapper (`.iframe-wrapper`)**: Styles iframe wrappers with flex basis, min-width, flex
  direction, and gap.
- **Iframe Container (`.iframe-container`)**: Styles the iframe container with flexbox, gap, margin,
  and flex wrap.
- **Iframes (`.iframe-container iframe`)**: Styles iframes with width, height, border,
  border-radius, and background color.
- **Share Button Container (`.share-button-container`)**: Styles the container for share buttons
  with text alignment.
- **Share Button (`.share-button`)**: Styles share buttons with padding, font size, font weight,
  color, background color, border, border-radius, cursor, transitions, and disabled state styles.
- **API Key Section (`.api-key-section`)**: Styles the API key section with padding, background
  color, and text alignment.
- **API Form (`.api-form`)**: Styles the API form container with max-width, margin, padding,
  background color, border-radius, and box-shadow.
- **CTA Section (`.cta-section`)**: Styles the call to action section with padding, text alignment,
  background color, relative positioning, and overflow hidden.
- **CTA Content (`.cta-content`)**: Styles the CTA content container with relative positioning,
  z-index, and max-width.
- **CTA Title (`.cta-title`)**: Styles the CTA title with font size, font weight, margin, and color.
- **CTA Subtitle (`.cta-subtitle`)**: Styles the CTA subtitle with font size, text color, and
  margin.
- **CTA Buttons (`.cta-buttons`)**: Styles the container for CTA buttons using flexbox,
  justification, gap, and flex wrap.
- **Secondary Button (`.secondary-button`)**: Styles secondary buttons with inline-block display,
  padding, font size, font weight, text decoration, color, background color, border, border-radius,
  transitions, cursor, and hover effects.
- **Footer (`footer`)**: Styles the footer with background color, padding, relative positioning.
- **Footer Content (`.footer-content`)**: Styles the footer content container using flexbox, flex
  wrap, and justification.
- **Footer Column (`.footer-column`)**: Styles footer columns with flex basis, min-width, and
  margin.
- **Footer Logo (`.footer-logo`)**: Styles the footer logo with font size, font weight, primary
  color, margin, display block, and no text decoration.
- **Footer Description (`.footer-description`)**: Styles the footer description with text color,
  margin, and max-width.
- **Footer Title (`.footer-title`)**: Styles footer titles with font size, font weight, margin, and
  color.
- **Footer Links (`.footer-links`)**: Styles footer links list with list styles.
- **Footer Links List Items (`.footer-links li`)**: Styles footer link list items with margin.
- **Footer Links Anchor (`.footer-links a`)**: Styles footer links with text color, no text
  decoration, and transitions, and hover effects.
- **Social Links (`.social-links`)**: Styles social links container using flexbox and gap.
- **Social Link (`.social-link`)**: Styles social link buttons with inline-flex, justification,
  alignment, width, height, border-radius, background color, color, text decoration, transitions,
  font size, and hover effects.
- **Footer Bottom (`.footer-bottom`)**: Styles the footer bottom section with text alignment,
  padding, border-top, text color, and font size.
- **Animations (`@keyframes titleFade`, `@keyframes subtitleFade`, `@keyframes buttonFade`,
  `@keyframes spin`, `@keyframes float`)**: Defines CSS animations for title, subtitle, button,
  spinner, and background circles.
- **Background Animation (`.background-animation`)**: Styles the background animation container with
  fixed positioning, top/left 0, width/height 100%, pointer events none, z-index, and overflow
  hidden.
- **Circle (`.circle`)**: Styles the animated circles in the background with absolute positioning,
  border-radius, gradient background, filter blur, and animation (`float`). Includes specific styles
  for each circle using `:nth-child()` selectors to vary size, position, and animation delay.
- **Media Queries (`@media (max-width: ...px)`)**: Defines responsive styles for different screen
  sizes (desktop, tablet, mobile), adjusting font sizes, paddings, grid layouts, flex directions,
  and hiding elements to optimize the layout for smaller devices.

## External Resources

The `index.html` file utilizes several external resources to enhance its functionality and
appearance:

- **Google Fonts (Poppins)**:
    - **Purpose**: Provides the "Poppins" font family for consistent typography across the website.
    - **Source**: Google Fonts API (`https://fonts.googleapis.com/css2?family=Poppins...`)
- **Font Awesome**:
    - **Purpose**: Offers a wide range of vector icons used throughout the website for visual cues
      and actions (e.g., brain logo, menu icon, play/stop icons, share icon, GitHub icon).
    - **Source**: CDN hosted by cdnjs
      (`https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css`)
- **Marked.js**:
    - **Purpose**: A JavaScript library used to parse Markdown text into HTML. This is used to
      render the `README.md` content in the preview iframe.
    - **Source**: CDN hosted by jsDelivr (`https://cdn.jsdelivr.net/npm/marked/marked.min.js`)
- **Google Analytics**:
    - **Purpose**: Website analytics service to track user behavior and website traffic.
    - **Source**: Google Tag Manager (`https://www.googletagmanager.com/gtag/js?id=G-9YPEGHMQ5P`)
- **`site.webmanifest`**:
    - **Purpose**: Web app manifest file that provides metadata about the web application for
      Progressive Web App (PWA) features, such as installability and offline capabilities (although
      not explicitly used in the provided code snippet, its inclusion indicates potential PWA
      intentions).
    - **Source**: `/site.webmanifest` (relative path, assumed to be in the root directory).
- **Favicon (`/favicon.ico`) and Apple Touch Icon (`/apple-touch-icon.png`)**:
    - **Purpose**: Icons used for browser tabs, bookmarks, and home screen icons on mobile devices.
    - **Source**: `/favicon.ico` and `/apple-touch-icon.png` (relative paths, assumed to be in the
      root directory).
- **Open Graph and Twitter Card Image (`/image.png`)**:
    - **Purpose**: Image used when the website is shared on social media platforms (Facebook,
      Twitter, etc.).
    - **Source**: `/image.png` (relative path, assumed to be in the root directory).

These external resources are included to enhance the user experience, visual design, and
functionality of the autovibe.dev web application.
