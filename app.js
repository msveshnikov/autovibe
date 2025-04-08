import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { existsSync, constants as fsConstants } from 'fs';

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
        const command = `bunx autocode-ai generate ${validatedModelName} ${apiKey}`;
        console.log(
            `Executing in ${folderPath} with model ${validatedModelName}: ${command.replace(apiKey, '****')}`
        );
        const executionTimeout = 600000;
        // eslint-disable-next-line no-unused-vars
        const child = exec(
            command,
            { cwd: folderPath, timeout: executionTimeout },
            (error, stdout, stderr) => {
                if (error) {
                    if (error.signal === 'SIGTERM' || (error.killed && error.code === null)) {
                        const timeoutMessage = `AutoCode CLI Error: Command timed out after ${executionTimeout / 1000} seconds.`;
                        console.error(timeoutMessage);
                        return reject(new Error(timeoutMessage));
                    }
                    const errorMessageContent = stderr || stdout || error.message;
                    const errorMessage = `AutoCode CLI Error: ${errorMessageContent}`;
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

app.use(express.static(path.join(__dirname, '.')));

app.use(
    '/projects',
    (req, res, next) => {
        const requestedPathDecoded = decodeURIComponent(req.path);
        const fullPath = path.join(projectsDir, requestedPathDecoded);
        const normalizedPath = path.normalize(fullPath);
        if (!normalizedPath.startsWith(projectsDir)) {
            console.warn(`Path traversal attempt blocked: ${req.path}`);
            return res.status(403).send('Forbidden');
        }
        if (!existsSync(normalizedPath)) {
            // Let express.static handle the 404
        }
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

    try {
        await fs.access(projectPath, fsConstants.R_OK);
    } catch (error) {
        console.error(`Error accessing project folder ${projectPath}:`, error);
        if (error.code === 'ENOENT') {
            return res.status(404).json({ message: `Project folder "${folderName}" not found.` });
        } else {
            return res
                .status(500)
                .json({ message: 'Error accessing project folder.', error: error.message });
        }
    }

    try {
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
        await fs.mkdir(currentIterationPath, { recursive: true });
        console.log(`Copying from ${previousIterationPath} to ${currentIterationPath}`);
        await fs.cp(previousIterationPath, currentIterationPath, { recursive: true });
        console.log(`Copy complete.`);

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
        let statusCode = 500;

        if (
            errorMessage.includes('Invalid API Key') ||
            errorMessage.includes('API key is invalid') ||
            errorMessage.includes('API_KEY_INVALID')
        ) {
            statusCode = 401;
        } else if (
            errorMessage.includes('Content generation blocked') ||
            errorMessage.includes('SAFETY_BLOCK') ||
            errorMessage.includes('SAFETY_SETTINGS')
        ) {
            statusCode = 400;
        } else if (errorMessage.includes('timed out')) {
            statusCode = 504;
        } else if (errorMessage.includes('command not found') || errorMessage.includes('ENOENT')) {
            if (error.syscall === 'spawn bunx' || errorMessage.includes('bunx')) {
                statusCode = 500;
                console.error(
                    'Potential setup issue: Check if "bunx" and "autocode-ai" are accessible in the environment.'
                );
            } else {
                statusCode = 500;
            }
        } else if (errorMessage.includes('RESOURCE_EXHAUSTED')) {
            statusCode = 429;
        } else if (error.code === 'EACCES') {
            statusCode = 500;
            console.error(`Permission error during file operations in ${projectPath}`);
        }

        res.status(statusCode).json({
            success: false,
            message: `Iteration ${iteration} failed.`,
            error: errorMessage,
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
                let latestIterationPath = '';

                try {
                    const iterationFolders = await fs.readdir(projectPath, { withFileTypes: true });
                    const iterationNumbers = iterationFolders
                        .filter((dirent) => dirent.isDirectory() && /^\d+$/.test(dirent.name))
                        .map((dirent) => parseInt(dirent.name, 10))
                        .sort((a, b) => b - a); // Sort descending to get latest first

                    if (iterationNumbers.length > 0) {
                        latestIteration = iterationNumbers[0];
                        latestIterationPath = path.join(projectPath, String(latestIteration));

                        // Try reading README.md for preview
                        try {
                            readmeContent = await fs.readFile(
                                path.join(latestIterationPath, 'README.md'),
                                'utf-8'
                            );
                        } catch (readError) {
                            console.warn(
                                `Could not read README.md for ${projectDir.name}/${latestIteration}: ${readError.message}`
                            );
                            readmeContent = `Error reading README.md: ${readError.code}`;
                        }

                        // We don't need to read index.html content for the HTML response, just the link
                    } else {
                        console.warn(`No valid iteration folders found in ${projectDir.name}`);
                    }
                } catch (iterError) {
                    console.error(`Error processing project ${projectDir.name}:`, iterError);
                }

                return {
                    folderName: projectDir.name,
                    latestIteration: latestIteration,
                    readmePreview:
                        readmeContent.substring(0, 300) + (readmeContent.length > 300 ? '...' : ''), // Limit preview size
                    latestIterationUrl:
                        latestIteration > 0
                            ? `/projects/${projectDir.name}/${latestIteration}/index.html`
                            : null
                };
            });

        let projects = await Promise.all(projectDataPromises);
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
        body { font-family: sans-serif; margin: 20px; background-color: #f4f4f4; }
        h1 { text-align: center; color: #333; }
        #project-library { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .project-card {
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
        }
        .project-card h2 {
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 1.1em;
            color: #0056b3;
            word-break: break-all; /* Prevent long IDs from overflowing */
        }
        .project-card .info {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 15px;
        }
        .project-card .preview {
            background-color: #f9f9f9;
            border: 1px solid #eee;
            padding: 10px;
            font-size: 0.85em;
            max-height: 150px; /* Limit preview height */
            overflow-y: auto; /* Add scroll if content exceeds max height */
            margin-bottom: 15px;
            white-space: pre-wrap; /* Preserve whitespace and wrap lines */
            word-wrap: break-word;
            flex-grow: 1; /* Allow preview to take available space */
        }
        .project-card .actions {
            margin-top: auto; /* Push actions to the bottom */
        }
        .project-card a {
            display: inline-block;
            padding: 8px 12px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 0.9em;
            transition: background-color 0.2s ease;
        }
        .project-card a:hover {
            background-color: #0056b3;
        }
        .no-projects { text-align: center; color: #777; margin-top: 50px; }
    </style>
</head>
<body>
    <h1>AutoVibe Project Library</h1>
`;

        if (projects.length === 0) {
            htmlResponse += '<p class="no-projects">No projects found yet.</p>';
        } else {
            htmlResponse += '<div id="project-library">';
            projects.forEach((project) => {
                const projectDate = new Date(parseInt(project.folderName, 10)).toLocaleString();
                htmlResponse += `
            <div class="project-card">
                <h2>Project ${project.folderName}</h2>
                <p class="info">Created: ${projectDate}<br>Latest Iteration: ${project.latestIteration}</p>
                <pre class="preview readme-preview" title="README.md Preview">${escapeHtml(project.readmePreview)}</pre>
                <div class="actions">
                    ${project.latestIterationUrl ? `<a href="${project.latestIterationUrl}" target="_blank">Open Latest HTML</a>` : '<span>No iterations available</span>'}
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
        if (error.code === 'ENOENT') {
            // If the main projects directory doesn't exist yet, return empty list HTML
            res.setHeader('Content-Type', 'text/html');
            res.send(`
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>AutoVibe Project Library</title><style>body { font-family: sans-serif; text-align: center; margin-top: 50px; color: #777; }</style></head><body><h1>AutoVibe Project Library</h1><p>No projects directory found.</p></body></html>`);
        } else {
            res.status(500).setHeader('Content-Type', 'text/html');
            res.send(`
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Error</title></head><body><h1>Error</h1><p>Failed to retrieve project library.</p><pre>${escapeHtml(error.message)}</pre></body></html>`);
        }
    }
});

app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
    res.status(err.status || 500).json({
        message: 'An unexpected error occurred.',
        error: message
    });
});

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
