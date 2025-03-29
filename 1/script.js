// script.js for Make Me Rich (Concept) - Satirical Scheme Generator

document.addEventListener('DOMContentLoaded', () => {
    console.log('Make Me Rich (Satirical Scheme Generator) script loaded and DOM fully parsed.');

    // --- DOM Elements ---
    const generateButton = document.getElementById('generate-button');
    const schemeDisplay = document.getElementById('scheme-display');

    // --- Scheme Components (Satirical) ---
    const actions = [
        'Leverage',
        'Monetize',
        'Synergize',
        'Disrupt',
        'Gamify',
        'Optimize',
        'Crowdsource',
        'Revolutionize',
        'Pivot',
        'Hack',
        'Automate',
        'Influencer-market',
        'Blockchain-enable',
        'AI-power'
    ];

    const subjects = [
        'artisanal toast',
        'cat memes',
        'discarded scooters',
        'the gig economy',
        'unpaid internships',
        'influencer tears',
        'sustainable micro-plastics',
        'quantum algorithms',
        'nostalgia',
        'corporate buzzwords',
        'existential dread',
        'NFTs of squirrels',
        'cloud-based pet rocks',
        'virtual real estate in the metaverse'
    ];

    const buzzwords = [
        'with blockchain',
        'through machine learning',
        'via the cloud',
        'on the metaverse',
        'using agile methodologies',
        'powered by AI',
        'for the creator economy',
        'in virtual reality',
        'with zero-click deployment',
        'as a service (aaS)',
        'generating passive income',
        'targeting millennials',
        'targeting Gen Z',
        'with viral potential'
    ];

    const outcomes = [
        'to achieve unparalleled ROI.',
        'for exponential growth.',
        'disrupting the traditional market.',
        'creating a new paradigm.',
        'leading to a guaranteed* unicorn valuation.',
        'and become a thought leader.',
        'making you the next big influencer.',
        'solving a problem nobody knew they had.',
        'generating massive shareholder value (for yourself).',
        'scaling infinitely towards the singularity.',
        'while sipping kombucha on a beanbag.',
        'resulting in a lucrative exit strategy.'
    ];

    // --- Helper Function: Get Random Element ---
    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // --- Generate Scheme Function ---
    function generateScheme() {
        const action = getRandomElement(actions);
        const subject = getRandomElement(subjects);
        const buzzword = getRandomElement(buzzwords);
        const outcome = getRandomElement(outcomes);

        const scheme = `${action} ${subject} ${buzzword} ${outcome}`;

        // Update the display area
        schemeDisplay.innerHTML = `
            <p>${scheme}</p>
            <p><small>*Guarantee still not guaranteed. Results may vary wildly. Do not invest based on this.</small></p>
        `;
    }

    // --- Event Listener ---
    if (generateButton) {
        generateButton.addEventListener('click', generateScheme);
    } else {
        console.error('Error: Generate button not found.');
    }

    // Initial message setup (optional, could be removed if HTML is sufficient)
    if (schemeDisplay) {
        // Optional: Clear the placeholder text slightly more dynamically
        // schemeDisplay.innerHTML = '<p>Click the button to generate your scheme...</p>';
    } else {
        console.error('Error: Scheme display area not found.');
    }
});

// --- No other helper functions needed for this simple version ---
