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
const runSingleIteration = (folderPath, apiKey) =>
    new Promise((resolve, reject) => {
        // Basic input sanitization for API key in command line
        // A more secure approach would involve environment variables or stdin if AutoCode supports it.

        // Ensure the model name is safe if it were dynamic (it's hardcoded here)
        const modelName = 'gemini-2.0-flash-thinking-exp-01-21'; // TODO: Make configurable?

        // Command: bunx autocode generate <model> <apiKey>
        // AutoCode CLI is expected to read README.md and update files in the CWD.
        const command = `bunx autocode-ai generate ${modelName} ${apiKey}`;

        console.log(`Executing in ${folderPath}: ${command.replace(apiKey, '****')}`); // Log command safely

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
app.use(express.json());
app.use(morgan('dev'));

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
        if (!existsSync(normalizedPath)) {
            // Let express.static handle 404 eventually, but log it here if needed
            // console.log(`Project file not found: ${normalizedPath}`);
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
    if (!apiKey) {
        return res.status(401).json({ message: 'Unauthorized: Missing API key.' });
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
            error: error.message
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
    if (!apiKey) {
        return res.status(401).json({ message: 'Unauthorized: Missing API key.' });
    }

    const { folderName } = req.body;
    if (!folderName || typeof folderName !== 'string' || !folderName.trim()) {
        return res.status(400).json({ message: 'Bad Request: Missing or invalid "folderName".' });
    }

    // Validate folderName format (e.g., ensure it's just a timestamp or simple name to prevent traversal)
    // Allow only digits (timestamps) or basic alphanumeric/hyphen/underscore
    if (!/^\d+$/.test(folderName) && !/^[a-zA-Z0-9_-]+$/.test(folderName)) {
        console.warn(`Invalid folderName format received: ${folderName}`);
        return res.status(400).json({ message: 'Bad Request: Invalid "folderName" format.' });
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
        const result = await runSingleIteration(folderPath, apiKey);
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

        if (
            errorMessage.includes('Invalid API Key') ||
            errorMessage.includes('API key is invalid') ||
            errorMessage.includes('API_KEY_INVALID')
        ) {
            statusCode = 401; // Unauthorized
        } else if (
            errorMessage.includes('Content generation blocked') ||
            errorMessage.includes('SAFETY_BLOCK')
        ) {
            statusCode = 400; // Bad Request (content issue)
        } else if (errorMessage.includes('timed out')) {
            statusCode = 504; // Gateway Timeout (if the CLI process timed out)
        } else if (errorMessage.includes('command not found') || errorMessage.includes('ENOENT')) {
            // Error executing the CLI itself (e.g., 'bunx' or 'autocode' not found)
            statusCode = 500; // Internal server error (configuration issue)
        }
        // Add more specific checks based on potential AutoCode CLI error patterns if known

        res.status(statusCode).json({
            success: false,
            message: 'Iteration failed.',
            error: errorMessage
        });
    }
});

// --- Root Route ---
// Serve index.html for the root path. Static middleware might handle this too,
// but an explicit route ensures it works as expected.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Server Start ---
// Ensure projects dir exists before starting server
ensureProjectsDir()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
            console.log(`Serving static files from root: ${__dirname}`);
            console.log(`Serving project files from: ${projectsDir}`);
        });
    })
    .catch((err) => {
        console.error('Failed to initialize server:', err);
        process.exit(1);
    });
