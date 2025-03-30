import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
// Serve static files (index.html, css, js, images)
app.use(express.static(path.join(__dirname, '.')));

// Function to call AutoCode CLI (placeholder for iterative logic)
const callAutoCodeCLI = (seed, apiKey) =>
    new Promise((resolve) => {
        // Basic input sanitization for shell command
        const sanitizedSeed = seed.replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$'); // Basic sanitization
        // save seed to a README.md file in dedicated (new) directory
        writeFileSync('3/README.md', sanitizedSeed);

        const command = `bunx autocode generate gemini-2.0-flash-thinking-exp-01-21 ${apiKey}`;
        console.log(`Executing AutoCode CLI: ${command}`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`AutoCode CLI Error: ${stderr || error.message}`);
                // Don't reject the promise here, return an error message in the result
                resolve(`AutoCode CLI execution failed: ${stderr || error.message}`);
            } else {
                resolve(stdout.trim());
            }
        });
    });

// Core thinking loop logic
const runThinkingLoop = async (seed, apiKey, iterationCount = 5) => {
    console.log(
        `Starting loop for seed: "${seed}" with ${iterationCount} iterations. API Key provided: ${!!apiKey}`
    );

    const results = [];
    let currentSeed = seed; // Use the original seed for the first iteration

    for (let i = 1; i <= iterationCount; i++) {
        console.log(`Running iteration ${i} with seed length: ${currentSeed.length}`); // Log length instead of full seed if it gets too long
        try {
            const geminiResult = await callAutoCodeCLI(currentSeed, apiKey);

            // Store the result for this iteration
            results.push({ iteration: i, output: geminiResult });

            // Update the seed for the next iteration by appending the result
            // Consider alternative strategies if context window becomes an issue
            currentSeed += '\n' + geminiResult;
        } catch (err) {
            console.error(`Error during iteration ${i}:`, err);
            results.push({ iteration: i, error: `Iteration failed: ${err.message}` });
            // Decide if loop should continue or break on error
            // Break if API key is invalid or other critical errors occur
            if (
                err.message.includes('Invalid API Key') ||
                err.message.includes('API Key is required') ||
                err.message.includes('Content generation blocked') // Stop if content is blocked
            ) {
                console.warn(`Stopping loop early due to critical error: ${err.message}`);
                break;
            }
            // Continue for other errors, logging them per iteration
        }
    }
    console.log(`Loop finished for seed: "${seed}"`);
    return results;
};

// API endpoint to trigger the thinking loop
app.post('/api/loop', async (req, res) => {
    const authHeader = req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Unauthorized: Missing or invalid API key format. Use Bearer token.'
        });
    }
    const apiKey = authHeader.split(' ')[1];
    if (!apiKey) {
        // This check might be redundant given the previous one, but ensures apiKey is not empty
        return res.status(401).json({ message: 'Unauthorized: Missing API key.' });
    }

    const { seed, iterationCount } = req.body;

    if (!seed || typeof seed !== 'string' || !seed.trim()) {
        return res.status(400).json({
            message: 'Bad Request: Missing or invalid "seed" input (must be a non-empty string).'
        });
    }

    const count = parseInt(iterationCount, 10);
    // Keep default/max iterations reasonable
    const finalIterationCount = isNaN(count) || count <= 0 ? 5 : Math.min(count, 20); // Default 5, max 20 (adjust as needed)

    try {
        const results = await runThinkingLoop(seed.trim(), apiKey, finalIterationCount);
        // Check if the loop ended early due to an API key error or content block
        const criticalError = results.find(
            (r) =>
                r.error &&
                (r.error.includes('Invalid API Key') ||
                    r.error.includes('API Key is required') ||
                    r.error.includes('Content generation blocked'))
        );
        if (criticalError) {
            // Return appropriate status code based on error
            const status = criticalError.error.includes('API Key') ? 401 : 400; // 401 for Auth, 400 for Content Block
            return res.status(status).json({ message: criticalError.error, results });
        }
        res.json({ results });
    } catch (error) {
        // Catch potential errors not caught within the loop (e.g., setup issues)
        console.error('Error in /api/loop handler:', error);
        // Distinguish between client errors (like bad API key detected early) and server errors
        if (error.message.includes('API Key is required')) {
            return res.status(401).json({ message: 'Unauthorized: ' + error.message });
        }
        res.status(500).json({ message: 'Internal Server Error', error: error.toString() });
    }
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
