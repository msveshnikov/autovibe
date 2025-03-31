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

app.get('/', (req, res) => {
    const acceptsHtml = req.accepts('html');
    if (acceptsHtml) {
        res.sendFile(path.join(__dirname, 'index.html'));
    } else {
        res.status(404).json({ message: 'Resource not found or invalid request type for /' });
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
