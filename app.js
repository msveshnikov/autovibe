import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

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
const callAutoCodeCLI = (seed) =>
    new Promise((resolve, reject) => {
        // Basic input sanitization for shell command
        const sanitizedSeed = seed.replace(/"/g, '\\"');
        // In a real scenario, consider more robust sanitization or alternative execution methods
        exec(`npx autocode-ai generate "${sanitizedSeed}"`, (error, stdout, stderr) => {
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
    // NOTE: The apiKey is received but currently NOT used in this loop logic.
    // The README suggests using it for external APIs (like Google AI).
    // This placeholder uses AutoCode CLI as per the original code.
    // A real implementation would integrate the external API here.

    console.log(
        `Starting loop for seed: "${seed}" with ${iterationCount} iterations. API Key provided: ${!!apiKey}`
    );

    const results = [];
    let currentSeed = seed;

    for (let i = 1; i <= iterationCount; i++) {
        console.log(`Running iteration ${i} with seed: "${currentSeed}"`);
        try {
            // Example: Call AutoCode CLI in each iteration
            // In a real scenario, this step would involve the core "thinking" process,
            // potentially using the apiKey, modifying the seed based on previous results, etc.
            const cliResult = await callAutoCodeCLI(currentSeed);

            // Store the result for this iteration
            results.push({ iteration: i, output: cliResult });

            // Placeholder: Modify seed for the next iteration (optional)
            // currentSeed = `${seed} - result: ${cliResult.substring(0, 20)}...`; // Example modification
        } catch (err) {
            console.error(`Error during iteration ${i}:`, err);
            results.push({ iteration: i, error: `Iteration failed: ${err.toString()}` });
            // Decide if loop should continue or break on error
            // break;
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
    const finalIterationCount = isNaN(count) || count <= 0 ? 5 : Math.min(count, 50); // Default 5, max 50

    try {
        // Pass apiKey to the loop function, even if it's not used internally yet
        const results = await runThinkingLoop(seed.trim(), apiKey, finalIterationCount);
        res.json({ results });
    } catch (error) {
        console.error('Error in /api/loop handler:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.toString() });
    }
});

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
