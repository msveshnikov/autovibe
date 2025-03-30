import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import fs from 'fs/promises'; // Use fs/promises
import { existsSync, constants as fsConstants } from 'fs'; // Use existsSync and constants

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectsDir = path.join(__dirname, 'projects');

const app = express();
const port = process.env.PORT || 3000;

// Allowed models (add more as needed)
const ALLOWED_MODELS = [
    'gemini-2.0-flash-thinking-exp-01-21', // Default/Fast
    'gemini-2.5-pro-exp-03-25' // Better/Slower
    // Add future model names here
];
const DEFAULT_MODEL = ALLOWED_MODELS[0];

// --- Helper Functions ---

// Ensure projects directory exists and is writable on startup
const ensureProjectsDir = async () => {
    try {
        await fs.access(projectsDir, fsConstants.W_OK | fsConstants.R_OK);
        console.log(`Projects directory (${projectsDir}) exists and is accessible.`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`Projects directory (${projectsDir}) does not exist. Creating...`);
            try {
                await fs.mkdir(projectsDir, { recursive: true });
                console.log('Projects directory created successfully.');
            } catch (mkdirError) {
                console.error(`Error creating projects directory (${projectsDir}):`, mkdirError);
                process.exit(1); // Exit if cannot create
            }
        } else if (error.code === 'EACCES') {
            console.error(
                `Error: Permission denied for projects directory (${projectsDir}). Please check permissions.`
            );
            process.exit(1); // Exit if cannot access
        } else {
            console.error('Error checking/creating projects directory:', error);
            process.exit(1);
        }
    }
};

// Function to run a single AutoCode CLI iteration within a specific folder
const runSingleIteration = (folderPath, apiKey, modelName) =>
    new Promise((resolve, reject) => {
        // Basic input sanitization for API key in command line
        // A more secure approach would involve environment variables or stdin if AutoCode supports it.

        // Validate model name against allowed list (already done in API handler, but good defense in depth)
        const validatedModelName = ALLOWED_MODELS.includes(modelName) ? modelName : DEFAULT_MODEL;

        // Command: bunx autocode-ai generate <model> <apiKey>
        // AutoCode CLI is expected to read README.md and update files in the CWD.
        // Ensure apiKey is treated as a single argument even if it contains special characters (less likely here, but good practice)
        // Using template literals is generally safe for constructing commands like this unless the variables contain malicious shell characters.
        // Since apiKey and modelName come from controlled input (validated), this is reasonably safe.
        const command = `bunx autocode-ai generate ${validatedModelName} ${apiKey}`;

        console.log(
            `Executing in ${folderPath} with model ${validatedModelName}: ${command.replace(apiKey, '****')}`
        ); // Log command safely

        // Set a timeout for the CLI command (e.g., 600 seconds)
        const executionTimeout = 600000; // 600 seconds in milliseconds

        // eslint-disable-next-line no-unused-vars
        const child = exec(
            command,
            { cwd: folderPath, timeout: executionTimeout },
            (error, stdout, stderr) => {
                if (error) {
                    // Check if error is due to timeout
                    if (error.signal === 'SIGTERM' || (error.killed && error.code === null)) {
                        const timeoutMessage = `AutoCode CLI Error: Command timed out after ${executionTimeout / 1000} seconds.`;
                        console.error(timeoutMessage);
                        return reject(new Error(timeoutMessage));
                    }
                    // Handle other errors
                    const errorMessage = `AutoCode CLI Error: ${stderr || stdout || error.message}`; // Include stdout in case error details are there
                    console.error(errorMessage);
                    // Reject the promise on error
                    reject(new Error(errorMessage));
                } else {
                    console.log(`AutoCode CLI Success: ${stdout.trim()}`);
                    resolve({ success: true, output: stdout.trim() });
                }
            }
        );
    });

// --- Middleware ---
app.use(express.json()); // For parsing application/json
app.use(morgan('dev')); // Logging HTTP requests

// --- Static File Serving ---
// Serve root static files (index.html, css, js, images)
app.use(express.static(path.join(__dirname, '.')));

// Serve files from the projects directory
// IMPORTANT: Add security checks to prevent path traversal
app.use(
    '/projects',
    (req, res, next) => {
        // Decode URL components to prevent encoded traversal sequences
        const requestedPathDecoded = decodeURIComponent(req.path);
        const fullPath = path.join(projectsDir, requestedPathDecoded);

        // Normalize the path to resolve '..' and '.'
        const normalizedPath = path.normalize(fullPath);

        // Check if the normalized path is still within the intended projects directory
        if (!normalizedPath.startsWith(projectsDir)) {
            console.warn(`Path traversal attempt blocked: ${req.path}`);
            return res.status(403).send('Forbidden');
        }

        // Check if the file exists before trying to serve
        // Note: express.static handles this, but checking here can add logging or custom logic if needed.
        if (!existsSync(normalizedPath)) {
            // console.log(`Project file not found: ${normalizedPath}`);
            // Let express.static handle the 404
        }

        // Continue to the static middleware
        next();
    },
    express.static(projectsDir)
);

// --- API Endpoints ---

// Endpoint to kick off a new session
app.post('/api/kickoff', async (req, res) => {
    const authHeader = req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Unauthorized: Missing or invalid API key format. Use Bearer token.'
        });
    }
    const apiKey = authHeader.split(' ')[1];
    if (!apiKey || !apiKey.trim()) {
        // Also check if the key is just whitespace
        return res.status(401).json({ message: 'Unauthorized: Missing or invalid API key.' });
    }

    const { seed } = req.body;
    if (!seed || typeof seed !== 'string' || !seed.trim()) {
        return res.status(400).json({ message: 'Bad Request: Missing or invalid "seed" input.' });
    }

    const timestamp = Date.now();
    const folderName = `${timestamp}`; // Use timestamp as unique folder name
    const folderPath = path.join(projectsDir, folderName);

    try {
        // 1. Create unique directory
        await fs.mkdir(folderPath, { recursive: true }); // Ensure parent 'projects' exists

        // 2. Save seed to README.md
        await fs.writeFile(path.join(folderPath, 'README.md'), seed.trim());

        // 3. Create empty placeholder files
        await fs.writeFile(
            path.join(folderPath, 'index.html'),
            `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AutoVibe Project ${folderName}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Project ${folderName}</h1>
    <p>Initial content. Waiting for AutoVibe iterations...</p>
    <script src="script.js"></script>
</body>
</html>`
        );
        await fs.writeFile(
            path.join(folderPath, 'style.css'),
            `/* AutoVibe Initial CSS for project ${folderName} */
body { font-family: sans-serif; padding: 20px; }`
        );
        await fs.writeFile(
            path.join(folderPath, 'script.js'),
            `// AutoVibe Initial JS for project ${folderName}
console.log('Project ${folderName} script loaded.');`
        );

        console.log(`Kickoff successful. Created project folder: ${folderName}`);
        // Respond with the created folder name
        res.status(201).json({ folderName: folderName }); // 201 Created
    } catch (error) {
        console.error(`Error during kickoff for folder ${folderName}:`, error);
        // Attempt cleanup? Might be complex if partially successful. Log error.
        res.status(500).json({
            message: 'Internal Server Error during kickoff.',
            error: error.message // Provide error message in response (consider if this is safe for prod)
        });
    }
});

// Endpoint to run a single iteration loop
app.post('/api/loop', async (req, res) => {
    const authHeader = req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Unauthorized: Missing or invalid API key format. Use Bearer token.'
        });
    }
    const apiKey = authHeader.split(' ')[1];
    if (!apiKey || !apiKey.trim()) {
        return res.status(401).json({ message: 'Unauthorized: Missing or invalid API key.' });
    }

    const { folderName, model } = req.body; // Expect modelName from frontend

    // Validate folderName
    if (!folderName || typeof folderName !== 'string' || !folderName.trim()) {
        return res.status(400).json({ message: 'Bad Request: Missing or invalid "folderName".' });
    }
    // Allow only digits (timestamps) or basic alphanumeric/hyphen/underscore
    if (!/^\d+$/.test(folderName) && !/^[a-zA-Z0-9_-]+$/.test(folderName)) {
        console.warn(`Invalid folderName format received: ${folderName}`);
        return res.status(400).json({ message: 'Bad Request: Invalid "folderName" format.' });
    }

    // Validate modelName
    const selectedModel = model && ALLOWED_MODELS.includes(model) ? model : DEFAULT_MODEL;
    if (!model) {
        console.warn(`Model name not provided by client, using default: ${DEFAULT_MODEL}`);
    } else if (!ALLOWED_MODELS.includes(model)) {
        console.warn(
            `Invalid model name "${model}" received from client, using default: ${DEFAULT_MODEL}`
        );
    }

    const folderPath = path.join(projectsDir, folderName);

    try {
        // Check if folder exists and is accessible before running iteration
        await fs.access(folderPath, fsConstants.R_OK | fsConstants.W_OK);
    } catch (error) {
        console.error(`Error accessing folder ${folderPath}:`, error);
        if (error.code === 'ENOENT') {
            return res.status(404).json({ message: `Project folder "${folderName}" not found.` });
        } else if (error.code === 'EACCES') {
            return res
                .status(403)
                .json({ message: `Permission denied for project folder "${folderName}".` });
        } else {
            return res
                .status(500)
                .json({ message: 'Error accessing project folder.', error: error.message });
        }
    }

    try {
        // Pass the validated/defaulted model name to the iteration function
        const result = await runSingleIteration(folderPath, apiKey, selectedModel);
        // AutoCode CLI modifies files directly within the folder.
        // We just report success back to the client so it can refresh the iframes.
        res.json({
            success: true,
            message: 'Iteration completed successfully.',
            cliOutput: result.output
        });
    } catch (error) {
        // runSingleIteration rejects with an Error object
        console.error(`Error during loop iteration for folder ${folderName}:`, error);

        // Analyze the error message to provide a more specific HTTP status code
        const errorMessage = error.message || 'Iteration failed due to an unknown error.';
        let statusCode = 500; // Default to Internal Server Error

        // Check for specific error patterns
        if (
            errorMessage.includes('Invalid API Key') ||
            errorMessage.includes('API key is invalid') ||
            errorMessage.includes('API_KEY_INVALID')
        ) {
            statusCode = 401; // Unauthorized
        } else if (
            errorMessage.includes('Content generation blocked') ||
            errorMessage.includes('SAFETY_BLOCK') ||
            errorMessage.includes('SAFETY_SETTINGS')
        ) {
            statusCode = 400; // Bad Request (content/safety issue)
        } else if (errorMessage.includes('timed out')) {
            statusCode = 504; // Gateway Timeout (if the CLI process timed out)
        } else if (errorMessage.includes('command not found') || errorMessage.includes('ENOENT')) {
            // Error executing the CLI itself (e.g., 'bunx' or 'autocode-ai' not found)
            statusCode = 500; // Internal server error (configuration issue)
            console.error(
                'Potential setup issue: Check if "bunx" and "autocode-ai" are accessible in the environment.'
            );
        } else if (errorMessage.includes('RESOURCE_EXHAUSTED')) {
            statusCode = 429; // Too Many Requests (Rate limit)
        }
        // Add more specific checks based on potential AutoCode CLI error patterns if known

        res.status(statusCode).json({
            success: false,
            message: 'Iteration failed.',
            error: errorMessage // Send back the specific error message
        });
    }
});

// --- Root Route ---
// Serve index.html for the root path. Static middleware might handle this too,
// but an explicit route ensures it works as expected.
app.get('/', (req, res) => {
    // Check if the request accepts HTML, otherwise it might be an API call expecting JSON
    // Although specific API routes are defined, this adds robustness.
    const acceptsHtml = req.accepts('html');
    if (acceptsHtml) {
        res.sendFile(path.join(__dirname, 'index.html'));
    } else {
        // If it's not accepting HTML (e.g., API client), send a 404 or appropriate response
        res.status(404).json({ message: 'Resource not found or invalid request type for /' });
    }
});

// --- Catch-all for 404 Not Found (API routes) ---
// This should come after all other routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found.' });
});

// --- Global Error Handler (Optional but recommended) ---
// Catches errors passed via next(error)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    // Avoid sending stack trace in production
    const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
    res.status(err.status || 500).json({
        message: 'An unexpected error occurred.',
        error: message
    });
});

// --- Server Start ---
// Ensure projects dir exists before starting server
ensureProjectsDir()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
            console.log(`Serving static files from root: ${__dirname}`);
            console.log(`Serving project files from: ${projectsDir}`);
            console.log(`Allowed models: ${ALLOWED_MODELS.join(', ')} (Default: ${DEFAULT_MODEL})`);
        });
    })
    .catch((err) => {
        console.error('Failed to initialize server:', err);
        process.exit(1);
    });
