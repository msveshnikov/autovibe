# Poker Game

A web-based implementation of a poker game using HTML, CSS, and JavaScript.

## Project Status

Initial planning and setup phase. Basic file structure created (`index.html`, `style.css`, `script.js`).

## Design Ideas and Considerations

### Game Variant

*   **Initial Focus:** Texas Hold'em (Player vs. Dealer/House) or 5-Card Draw (Single Player). Texas Hold'em is often more engaging but more complex to implement initially. 5-Card Draw might be a simpler starting point.
*   **Future:** Potentially expand to other variants or add simple AI opponents.

### User Interface (UI) - `index.html` / `style.css`

*   **Layout:** Design a clear table layout. Define areas for player hand, dealer/community cards, pot, player actions, and status messages.
*   **Card Representation:**
    *   Option 1: Use standard playing card Unicode characters (e.g., `&spades;`, `&hearts;`) styled with CSS.
    *   Option 2: Use image assets for cards (requires sourcing or creating images).
    *   Option 3: Pure CSS cards (more complex but flexible).
*   **Controls:** Implement clear buttons for player actions (e.g., Deal, Bet/Check, Call, Raise, Fold). Disable buttons when actions are not applicable.
*   **Information Display:** Show player chips/score, current bet, pot size, and game status messages (e.g., "Your turn", "Player wins with a Flush").
*   **Responsiveness:** Ensure the layout adapts reasonably well to different screen sizes using CSS media queries.

### Gameplay Logic - `script.js`

*   **Deck Management:**
    *   Create a standard 52-card deck.
    *   Implement a reliable shuffling algorithm (e.g., Fisher-Yates shuffle).
    *   Manage dealing cards to players/community areas.
*   **Hand Evaluation:**
    *   Develop functions to detect poker hand ranks (Royal Flush, Straight Flush, Four of a Kind, Full House, Flush, Straight, Three of a Kind, Two Pair, One Pair, High Card).
    *   Compare hands to determine the winner.
*   **Game Flow:**
    *   Manage turns between player and dealer/AI (if applicable).
    *   Handle betting rounds: Allow players to check, bet, call, raise, or fold according to poker rules.
    *   Determine the end of a round and award the pot.
    *   Handle game start/reset.
*   **State Management:** Keep track of the current game state (e.g., pre-deal, flop, turn, river, showdown), player hands, community cards, bets, and pot size.

### Styling - `style.css`

*   **Theme:** Choose a visual theme (e.g., classic casino green felt, minimalist, dark mode).
*   **Clarity:** Ensure text, buttons, and card values are easily readable.
*   **Visual Feedback:** Use subtle animations or style changes to indicate active player, dealt cards, winning hands, etc.

## Technology Stack

*   HTML5
*   CSS3
*   Vanilla JavaScript (ES6+)

## Getting Started (Placeholder)

*(Instructions on how to run or play the game will be added here once implemented.)*

## Future Enhancements (Optional)

*   Basic AI opponent logic.
*   Sound effects for dealing, betting, winning.
*   Chip management and betting increments.
*   Saving scores/chips using `localStorage`.
*   Support for multiple human players (pass-and-play or networked).