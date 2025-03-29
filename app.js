import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
// Serve static files (index.html, css, js, images)
app.use(express.static(path.join(__dirname, '.')));

// Function to call Google Gemini Flash model
const callGeminiFlash = async (seed, apiKey) => {
    if (!apiKey) {
        throw new Error('API Key is required to call the Gemini model.');
    }
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-thinking-exp-01-21' });

        const result = await model.generateContent(seed);
        const response = result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error('Gemini API Error:', error);
        // Check for specific API-related errors if needed
        if (error.message.includes('API key not valid')) {
            throw new Error(`Gemini API execution failed: Invalid API Key. Please check your key.`);
        }
        throw new Error(`Gemini API execution failed: ${error.message}`);
    }
};

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
    console.log(
        `Starting loop for seed: "${seed}" with ${iterationCount} iterations. API Key provided: ${!!apiKey}`
    );

    const results = [];
    let currentSeed = seed; // Use the original seed for each iteration as per request interpretation

    for (let i = 1; i <= iterationCount; i++) {
        console.log(`Running iteration ${i} with seed: "${currentSeed}"`);
        try {
            // Call Gemini Flash model in each iteration
            const geminiResult = await callGeminiFlash(currentSeed, apiKey);

            // Store the result for this iteration
            results.push({ iteration: i, output: geminiResult });

            currentSeed += geminiResult;
        } catch (err) {
            console.error(`Error during iteration ${i}:`, err);
            results.push({ iteration: i, error: `Iteration failed: ${err.message}` });
            // Decide if loop should continue or break on error
            // Break if API key is invalid or other critical errors occur
            if (
                err.message.includes('Invalid API Key') ||
                err.message.includes('API Key is required')
            ) {
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
    const finalIterationCount = isNaN(count) || count <= 0 ? 5 : Math.min(count, 50); // Default 5, max 50

    try {
        const results = await runThinkingLoop(seed.trim(), apiKey, finalIterationCount);
        // Check if the loop ended early due to an API key error
        const apiKeyError = results.find(
            (r) =>
                r.error &&
                (r.error.includes('Invalid API Key') || r.error.includes('API Key is required'))
        );
        if (apiKeyError) {
            // Return 401 if there was an API key issue during the loop
            return res.status(401).json({ message: apiKeyError.error, results });
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

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
