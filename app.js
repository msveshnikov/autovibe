import express from 'express';
import { exec } from 'child_process';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const callAutoCodeCLI = (seed) =>
    new Promise((resolve, reject) => {
        exec(`autocode generate "${seed}"`, (error, stdout, stderr) => {
            if (error) {
                return reject(stderr || error.message);
            }
            resolve(stdout.trim());
        });
    });

const runThinkingLoop = async (seed) => {
    let cliResult;
    try {
        cliResult = await callAutoCodeCLI(seed);
    } catch (err) {
        cliResult = `AutoCode CLI error: ${err}`;
    }
    const results = [];
    for (let i = 1; i <= 5; i++) {
        results.push(`Iteration ${i}: ${cliResult} processed with seed "${seed}"`);
    }
    return results;
};

app.post('/api/loop', async (req, res) => {
    const authHeader = req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: Missing API key' });
    }
    const apiKey = authHeader.split(' ')[1];
    if (!apiKey) {
        return res.status(401).json({ message: 'Unauthorized: Missing API key' });
    }
    const { seed } = req.body;
    if (!seed || !seed.trim()) {
        return res.status(400).json({ message: 'Bad Request: Missing seed input' });
    }
    try {
        const results = await runThinkingLoop(seed.trim());
        res.json({ results });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.toString() });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
