// script.js for Make Me Rich (Concept) - Satirical Scheme Generator

document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate-button');
    const schemeDisplay = document.getElementById('scheme-display');

    const schemeComponents = {
        actions: [
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
        ],
        subjects: [
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
        ],
        buzzwords: [
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
        ],
        outcomes: [
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
        ]
    };

    function getRandomElement(arr) {
        if (!arr || arr.length === 0) {
            console.error('Cannot get random element from empty or invalid array.');
            return '[Error: Invalid Data]';
        }
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function generateScheme() {
        const action = getRandomElement(schemeComponents.actions);
        const subject = getRandomElement(schemeComponents.subjects);
        const buzzword = getRandomElement(schemeComponents.buzzwords);
        const outcome = getRandomElement(schemeComponents.outcomes);

        const scheme = `${action} ${subject} ${buzzword} ${outcome}`;

        if (schemeDisplay) {
            schemeDisplay.innerHTML = `
                <p>${scheme}</p>
                <p><small>*Guarantee still not guaranteed. Results may vary wildly. Do not invest based on this.</small></p>
            `;
        } else {
            console.error('Error: Scheme display area not found during generation.');
        }
    }

    if (generateButton) {
        generateButton.addEventListener('click', generateScheme);
    } else {
        console.error('Error: Generate button element not found.');
    }

    if (!schemeDisplay) {
        console.error('Error: Scheme display area element not found on load.');
    }
});
