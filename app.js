import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { constants as fsConstants } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectsDir = path.join(__dirname, 'projects');

const app = express();
const port = process.env.PORT || 3000;

const ALLOWED_MODELS = [
    'gemini-2.0-flash-thinking-exp-01-21',
    'gemini-2.5-pro-exp-03-25',
    'claude-3-7-sonnet-20250219',
    'deepseek-reasoner',
    'o3-mini'
];
const DEFAULT_MODEL = ALLOWED_MODELS[0];
const MIN_ITERATIONS_FOR_LIB = 3; // Minimum iterations to show in library

// Helper function to escape HTML special characters
function escapeHtml(unsafe) {
    if (!unsafe || typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

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
                process.exit(1);
            }
        } else if (error.code === 'EACCES') {
            console.error(
                `Error: Permission denied for projects directory (${projectsDir}). Please check permissions.`
            );
            process.exit(1);
        } else {
            console.error('Error checking/creating projects directory:', error);
            process.exit(1);
        }
    }
};

const runSingleIteration = (folderPath, apiKey, modelName) =>
    new Promise((resolve, reject) => {
        const validatedModelName = ALLOWED_MODELS.includes(modelName) ? modelName : DEFAULT_MODEL;
        // Basic sanitization for command arguments (model name is validated, API key is complex)
        // Avoid using user input directly in shell commands if possible, but here it's somewhat controlled.
        const command = `bunx autocode-ai generate "${validatedModelName}" "${apiKey}"`;
        console.log(
            `Executing in ${folderPath} with model ${validatedModelName}: ${command.replace(apiKey, '****')}`
        );
        const executionTimeout = 600000; // 10 minutes
        // eslint-disable-next-line no-unused-vars
        const child = exec(
            command,
            { cwd: folderPath, timeout: executionTimeout, shell: true }, // Use shell: true for complex commands like bunx
            (error, stdout, stderr) => {
                if (error) {
                    if (error.signal === 'SIGTERM' || (error.killed && error.code === null)) {
                        const timeoutMessage = `AutoCode CLI Error: Command timed out after ${executionTimeout / 1000} seconds.`;
                        console.error(timeoutMessage);
                        return reject(new Error(timeoutMessage));
                    }
                    const errorMessageContent = stderr || stdout || error.message;
                    // Try to extract a more specific error message from stderr/stdout
                    let detailedError = errorMessageContent;
                    // Example: Extracting specific error types if known patterns exist in autocode-ai output
                    if (stderr.includes('API key not valid')) {
                        detailedError = 'Invalid API Key provided.';
                    } else if (stderr.includes('rate limit exceeded')) {
                        detailedError = 'API Rate Limit Exceeded.';
                    } else if (stderr.includes('SAFETY_BLOCK')) {
                        detailedError = 'Content generation blocked due to safety settings.';
                    }

                    const errorMessage = `AutoCode CLI Error: ${detailedError}`;
                    console.error(errorMessage);
                    reject(new Error(errorMessage));
                } else {
                    console.log(`AutoCode CLI Success: ${stdout.trim()}`);
                    resolve({ success: true, output: stdout.trim() });
                }
            }
        );
    });

app.use(express.json());
app.use(morgan('dev'));

// Serve static files from the root directory (for index.html, images, etc.)
app.use(express.static(path.join(__dirname, '.')));

// Middleware to serve project files with path traversal protection
app.use(
    '/projects',
    (req, res, next) => {
        const requestedPathDecoded = decodeURIComponent(req.path);
        // Resolve the path to prevent directory traversal (e.g., ../../)
        const fullPath = path.resolve(projectsDir, requestedPathDecoded.substring(1)); // Use resolve for better security

        // Check if the resolved path is still within the intended projects directory
        if (!fullPath.startsWith(projectsDir)) {
            console.warn(`Path traversal attempt blocked: ${req.path}`);
            return res.status(403).send('Forbidden');
        }

        // Check existence *before* passing to express.static if needed,
        // but express.static handles 404s fine.
        // This check is mainly for the traversal protection.
        next();
    },
    express.static(projectsDir)
);

app.post('/api/kickoff', async (req, res) => {
    const authHeader = req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Unauthorized: Missing or invalid API key format. Use Bearer token.'
        });
    }
    const apiKey = authHeader.split(' ')[1];
    // Basic check for key presence, not validity
    if (!apiKey || !apiKey.trim()) {
        return res.status(401).json({ message: 'Unauthorized: Missing or invalid API key.' });
    }

    const { seed } = req.body;
    if (!seed || typeof seed !== 'string' || !seed.trim()) {
        return res.status(400).json({ message: 'Bad Request: Missing or invalid "seed" input.' });
    }

    const timestamp = Date.now();
    const folderName = `${timestamp}`;
    const projectPath = path.join(projectsDir, folderName);
    const initialIteration = 1;
    const initialIterationPath = path.join(projectPath, String(initialIteration));

    try {
        await fs.mkdir(initialIterationPath, { recursive: true });
        await fs.writeFile(path.join(initialIterationPath, 'README.md'), seed.trim());
        await fs.writeFile(
            path.join(initialIterationPath, 'index.html'),
            `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AutoVibe Project ${folderName} - Iteration ${initialIteration}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Project ${folderName} - Iteration ${initialIteration}</h1>
    <p>Initial content based on seed. Waiting for AutoVibe iterations...</p>
    <script src="script.js"></script>
</body>
</html>`
        );
        await fs.writeFile(
            path.join(initialIterationPath, 'style.css'),
            `/* AutoVibe Initial CSS for project ${folderName} - Iteration ${initialIteration} */
body { font-family: sans-serif; padding: 20px; }`
        );
        await fs.writeFile(
            path.join(initialIterationPath, 'script.js'),
            `// AutoVibe Initial JS for project ${folderName} - Iteration ${initialIteration}
console.log('Project ${folderName} - Iteration ${initialIteration} script loaded.');`
        );

        console.log(
            `Kickoff successful. Created project folder: ${folderName}, Initial Iteration: ${initialIteration}`
        );
        res.status(201).json({ folderName: folderName, initialIteration: initialIteration });
    } catch (error) {
        console.error(`Error during kickoff for folder ${folderName}:`, error);
        res.status(500).json({
            message: 'Internal Server Error during kickoff.',
            error: error.message
        });
    }
});

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

    const { folderName, model, iteration } = req.body;

    if (!folderName || typeof folderName !== 'string' || !folderName.trim()) {
        return res.status(400).json({ message: 'Bad Request: Missing or invalid "folderName".' });
    }
    // Validate folderName format (should be a timestamp)
    if (!/^\d+$/.test(folderName)) {
        console.warn(`Invalid folderName format received: ${folderName}`);
        return res.status(400).json({ message: 'Bad Request: Invalid "folderName" format.' });
    }

    if (typeof iteration !== 'number' || !Number.isInteger(iteration) || iteration <= 1) {
        return res.status(400).json({
            message: `Bad Request: Invalid "iteration" number (${iteration}). Must be an integer greater than 1.`
        });
    }

    const selectedModel = model && ALLOWED_MODELS.includes(model) ? model : DEFAULT_MODEL;
    if (!model) {
        console.warn(`Model name not provided by client, using default: ${DEFAULT_MODEL}`);
    } else if (!ALLOWED_MODELS.includes(model)) {
        console.warn(
            `Invalid model name "${model}" received from client, using default: ${DEFAULT_MODEL}`
        );
    }

    const projectPath = path.join(projectsDir, folderName);
    const previousIteration = iteration - 1;
    const previousIterationPath = path.join(projectPath, String(previousIteration));
    const currentIterationPath = path.join(projectPath, String(iteration));

    // Use resolve for security against path traversal in folderName
    const resolvedProjectPath = path.resolve(projectsDir, folderName);
    if (!resolvedProjectPath.startsWith(projectsDir)) {
        console.warn(`Potential path traversal attempt in loop folderName: ${folderName}`);
        return res.status(400).json({ message: 'Bad Request: Invalid "folderName".' });
    }

    try {
        // Check if previous iteration exists before proceeding
        await fs.access(previousIterationPath, fsConstants.R_OK);
    } catch (error) {
        console.error(`Error accessing previous iteration folder ${previousIterationPath}:`, error);
        if (error.code === 'ENOENT') {
            return res.status(404).json({
                message: `Previous iteration folder "${previousIteration}" not found for project "${folderName}". Cannot proceed.`
            });
        } else {
            return res.status(500).json({
                message: 'Error accessing previous iteration folder.',
                error: error.message
            });
        }
    }

    try {
        // Ensure current iteration directory exists (should be safe due to previous checks)
        await fs.mkdir(currentIterationPath, { recursive: true });

        // Copy files from previous iteration
        console.log(`Copying from ${previousIterationPath} to ${currentIterationPath}`);
        await fs.cp(previousIterationPath, currentIterationPath, { recursive: true });
        console.log(`Copy complete.`);

        // Run the AutoCode CLI command
        const result = await runSingleIteration(currentIterationPath, apiKey, selectedModel);

        res.json({
            success: true,
            message: `Iteration ${iteration} completed successfully.`,
            cliOutput: result.output,
            iteration: iteration
        });
    } catch (error) {
        console.error(`Error during loop iteration ${iteration} for folder ${folderName}:`, error);

        const errorMessage = error.message || 'Iteration failed due to an unknown error.';
        let statusCode = 500; // Default to internal server error

        // Map specific error messages to HTTP status codes
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
            statusCode = 400; // Bad Request (due to content policy)
        } else if (errorMessage.includes('timed out')) {
            statusCode = 504; // Gateway Timeout
        } else if (errorMessage.includes('command not found') || errorMessage.includes('ENOENT')) {
            // Check if it's specifically the bunx/autocode command
            if (
                (error.syscall === 'spawn bunx' || errorMessage.includes('bunx')) &&
                (error.path === 'bunx' || error.spawnargs?.includes('autocode-ai'))
            ) {
                statusCode = 500;
                console.error(
                    'Potential setup issue: Check if "bunx" and "autocode-ai" are accessible in the environment PATH.'
                );
            } else {
                statusCode = 500; // Other command not found errors
            }
        } else if (
            errorMessage.includes('RESOURCE_EXHAUSTED') ||
            errorMessage.includes('Rate Limit Exceeded')
        ) {
            statusCode = 429; // Too Many Requests
        } else if (error.code === 'EACCES') {
            statusCode = 500; // Internal Server Error (Permission Denied)
            console.error(`Permission error during file operations in ${currentIterationPath}`);
        } else if (error.code === 'ENOENT' && error.path === previousIterationPath) {
            // This case should be caught earlier, but handle defensively
            statusCode = 404;
        }

        // Clean up the potentially created current iteration folder on failure?
        // fs.rm(currentIterationPath, { recursive: true, force: true }).catch(cleanupErr => {
        //     console.error(`Error cleaning up failed iteration folder ${currentIterationPath}:`, cleanupErr);
        // });

        res.status(statusCode).json({
            success: false,
            message: `Iteration ${iteration} failed.`,
            error: errorMessage, // Send back the parsed/original error message
            iteration: iteration
        });
    }
});

// Endpoint to list projects and return HTML for library display
app.get('/api/lib', async (req, res) => {
    try {
        const projectFolders = await fs.readdir(projectsDir, { withFileTypes: true });
        const projectDataPromises = projectFolders
            .filter((dirent) => dirent.isDirectory() && /^\d+$/.test(dirent.name)) // Filter for directories named like timestamps
            .map(async (projectDir) => {
                const projectPath = path.join(projectsDir, projectDir.name);
                let latestIteration = 0;
                let readmeContent = 'N/A';
                let iterationNumbers = [];

                try {
                    const iterationFolders = await fs.readdir(projectPath, { withFileTypes: true });
                    iterationNumbers = iterationFolders
                        .filter((dirent) => dirent.isDirectory() && /^\d+$/.test(dirent.name))
                        .map((dirent) => parseInt(dirent.name, 10))
                        .sort((a, b) => a - b); // Sort ascending for history buttons

                    if (iterationNumbers.length > 0) {
                        latestIteration = iterationNumbers[iterationNumbers.length - 1]; // Last one is latest
                        const latestIterationPath = path.join(projectPath, String(latestIteration));

                        // Try reading README.md for preview
                        try {
                            readmeContent = await fs.readFile(
                                path.join(latestIterationPath, 'README.md'),
                                'utf-8'
                            );
                        } catch (readError) {
                            if (readError.code !== 'ENOENT') {
                                console.warn(
                                    `Could not read README.md for ${projectDir.name}/${latestIteration}: ${readError.message}`
                                );
                            }
                            readmeContent = `(README.md not found or unreadable)`;
                        }
                    } else {
                        console.warn(`No valid iteration folders found in ${projectDir.name}`);
                        return null; // Exclude projects with no iterations
                    }
                } catch (iterError) {
                    console.error(`Error processing project ${projectDir.name}:`, iterError);
                    return null; // Exclude projects that errored during processing
                }

                // Filter out projects with fewer than MIN_ITERATIONS_FOR_LIB
                if (latestIteration < MIN_ITERATIONS_FOR_LIB) {
                    return null;
                }

                return {
                    folderName: projectDir.name,
                    latestIteration: latestIteration,
                    readmePreview:
                        readmeContent.substring(0, 300) + (readmeContent.length > 300 ? '...' : ''), // Limit preview size
                    iterationHistory: iterationNumbers, // Keep all iteration numbers
                    latestIterationUrl: `/projects/${projectDir.name}/${latestIteration}/index.html`
                };
            });

        let projects = (await Promise.all(projectDataPromises)).filter((p) => p !== null); // Filter out nulls
        // Sort projects by folder name (timestamp) descending (newest first)
        projects.sort((a, b) => parseInt(b.folderName, 10) - parseInt(a.folderName, 10));

        // Generate HTML response
        let htmlResponse = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AutoVibe Project Library</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px; background-color: #f0f2f5; color: #1c1e21; }
        h1 { text-align: center; color: #1877f2; margin-bottom: 30px; }
        #project-library { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .project-card {
            background-color: #fff;
            border: 1px solid #dddfe2;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            transition: box-shadow 0.2s ease-in-out;
        }
        .project-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .project-card h2 {
            margin-top: 0;
            margin-bottom: 8px;
            font-size: 1.15em;
            color: #1877f2; /* Facebook blue */
            word-break: break-word;
        }
        .project-card .info {
            font-size: 0.85em;
            color: #606770; /* Secondary text color */
            margin-bottom: 12px;
            line-height: 1.4;
        }
        .project-card .preview {
            background-color: #f5f6f7; /* Lighter background for preview */
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            padding: 10px;
            font-size: 0.8em;
            max-height: 150px;
            overflow-y: auto;
            margin-bottom: 15px;
            white-space: pre-wrap;
            word-wrap: break-word;
            color: #333;
            flex-grow: 1;
        }
        .project-card .actions {
            margin-top: auto; /* Push actions to the bottom */
            padding-top: 10px;
            border-top: 1px solid #eee;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
        }
        .project-card .action-button {
            display: inline-block;
            padding: 6px 12px;
            background-color: #1877f2;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-size: 0.9em;
            font-weight: 500;
            border: none;
            cursor: pointer;
            text-align: center;
            transition: background-color 0.2s ease;
        }
        .project-card .action-button:hover { background-color: #166fe5; }
        .project-card .history-buttons {
            margin-top: 5px; /* Space between latest button and history */
             display: flex;
             flex-wrap: wrap;
             gap: 5px;
        }
         .project-card .history-button {
            padding: 3px 6px;
            font-size: 0.75em;
            background-color: #e4e6eb; /* Grey background */
            color: #050505; /* Dark text */
             border-radius: 4px;
             text-decoration: none;
             border: 1px solid #ccd0d5;
             transition: background-color 0.2s ease, border-color 0.2s ease;
         }
         .project-card .history-button:hover {
             background-color: #dcdfe4;
             border-color: #bec3c9;
         }
        .no-projects { text-align: center; color: #606770; margin-top: 50px; font-size: 1.1em; }
    </style>
</head>
<body>
    <h1>AutoVibe Project Library</h1>
`;

        if (projects.length === 0) {
            htmlResponse += `<p class="no-projects">No projects found with ${MIN_ITERATIONS_FOR_LIB} or more iterations.</p>`;
        } else {
            htmlResponse += '<div id="project-library">';
            projects.forEach((project) => {
                const projectDate = new Date(parseInt(project.folderName, 10)).toLocaleString();
                let historyButtonsHtml = '<div class="history-buttons">';
                project.iterationHistory.forEach((iterNum) => {
                    if (iterNum > 2) {
                        historyButtonsHtml += `<a href="/projects/${project.folderName}/${iterNum}/index.html" target="_blank" class="history-button" title="Open Iteration ${iterNum}">${iterNum}</a>`;
                    }
                });
                historyButtonsHtml += '</div>';

                htmlResponse += `
            <div class="project-card">
                <h2>Project ${project.folderName}</h2>
                <p class="info">Created: ${projectDate}<br>Iterations: ${project.latestIteration}</p>
                <pre class="preview readme-preview" title="README.md Preview (Latest Iteration)">${escapeHtml(project.readmePreview)}</pre>
                <div class="actions">
                    <a href="${project.latestIterationUrl}" target="_blank" class="action-button">Open Latest HTML (Iter ${project.latestIteration})</a>
                    ${historyButtonsHtml}
                </div>
            </div>`;
            });
            htmlResponse += '</div>'; // End #project-library
        }

        htmlResponse += `
</body>
</html>`;

        res.setHeader('Content-Type', 'text/html');
        res.send(htmlResponse);
    } catch (error) {
        console.error('Error retrieving project library:', error);
        let errorHtml;
        if (error.code === 'ENOENT' && error.path === projectsDir) {
            errorHtml = `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>AutoVibe Project Library</title><style>body { font-family: sans-serif; text-align: center; margin-top: 50px; color: #777; }</style></head><body><h1>AutoVibe Project Library</h1><p>The 'projects' directory does not exist yet. Start a loop to create it.</p></body></html>`;
        } else {
            errorHtml = `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Error</title></head><body><h1>Error Retrieving Library</h1><p>Failed to retrieve project library due to an internal error.</p><pre>${escapeHtml(error.message)}</pre></body></html>`;
        }
        res.status(500).setHeader('Content-Type', 'text/html').send(errorHtml);
    }
});

// Catch-all for undefined API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found.' });
});

// Catch-all for non-API GET requests - serve index.html for SPA routing
app.get('*', (req, res, next) => {
    // Avoid serving index.html for file requests that should have been static
    if (req.path.includes('.')) {
        return next(); // Let it 404 if static middleware didn't find it
    }
    // Serve index.html for potential client-side routes
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Generic error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    const statusCode = err.status || 500;
    const message =
        process.env.NODE_ENV === 'production' && statusCode === 500
            ? 'Internal Server Error'
            : err.message || 'An unexpected error occurred.';

    res.status(statusCode).json({
        message: 'An unexpected error occurred on the server.',
        error: message
    });
});

// Initialize projects directory and start server
ensureProjectsDir()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
            console.log(`Serving static files from root: ${__dirname}`);
            console.log(`Serving project files from: ${projectsDir}`);
            console.log(`Allowed models: ${ALLOWED_MODELS.join(', ')} (Default: ${DEFAULT_MODEL})`);
            console.log(`Library minimum iterations: ${MIN_ITERATIONS_FOR_LIB}`);
        });
    })
    .catch((err) => {
        console.error('Failed to initialize server:', err);
        process.exit(1);
    });
