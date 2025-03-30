# Poker Game

A web-based implementation of a poker game using HTML, CSS, and JavaScript.

## Project Status

Initial planning and setup phase. Basic file structure created (`index.html`, `style.css`,
`script.js`). Focus is currently on building the core logic for a single-player experience.

## Design Ideas and Considerations

### Game Variant

- **Initial Focus:** Texas Hold'em (Player vs. Dealer/House) or 5-Card Draw (Single Player).
    - **Decision:** Start with 5-Card Draw for simpler initial implementation (dealing, fewer
      betting rounds, simpler hand comparison). Texas Hold'em can be a goal after the core mechanics
      are solid.
- **Future:** Expand to Texas Hold'em, potentially add simple AI opponents for either variant.

### User Interface (UI) - `index.html` / `style.css`

- **Layout:** Design a clear table layout. Define areas for player hand, dealer hand (if
  applicable), deck, discard pile (for 5-Card Draw), pot/chips, player action buttons, and status
  messages.
- **Card Representation:**
    - Option 1: Use standard playing card Unicode characters (e.g., `&spades;`, `&hearts;`) styled
      with CSS. (Simple, limited visuals)
    - Option 2: Use image assets for cards (requires sourcing/creating images, more visually
      appealing).
    - Option 3: Pure CSS cards (more complex CSS but flexible, no external assets).
    - **Option 4:** SVG cards (Scalable, can be styled with CSS, potentially generated or sourced).
- **Controls:** Implement clear buttons for player actions (e.g., Deal, Draw/Discard, Bet/Check,
  Fold). Buttons should be disabled/hidden when actions are not applicable. Ensure clear visual
  states (hover, active, disabled).
- **Information Display:** Show player chips/score, current bet amount, pot size, and clear game
  status messages (e.g., "Your turn to draw", "Dealer wins with a Straight", "Player folds").
- **Responsiveness:** Employ a mobile-first approach. Ensure the layout adapts cleanly to various
  screen sizes using CSS Flexbox/Grid and media queries.
- **Feedback:** Provide immediate visual feedback for actions like dealing cards (simple animation),
  highlighting selected cards for discard, indicating the winning hand, and chip movements.
- **Accessibility:** Consider basic accessibility: sufficient color contrast, semantic HTML,
  keyboard navigation for controls (buttons).

### Gameplay Logic - `script.js`

- **Modularity:** Structure JavaScript logically. Even within a single `script.js` file initially,
  consider organizing code into functions or potentially objects/classes representing key entities
  (e.g., `Deck`, `Player`, `HandEvaluator`, `Game`). This aids readability and future refactoring.
- **Deck Management:**
    - Create a standard 52-card deck object/array.
    - Implement a reliable shuffling algorithm (e.g., Fisher-Yates).
    - Functions for dealing cards and managing the deck state (drawing, discarding).
- **Hand Evaluation:**
    - Develop robust functions to detect all standard poker hand ranks (Royal Flush down to High
      Card).
    - Implement logic to compare hands accurately, including handling kickers for ties where
      applicable.
    - **Testing:** This logic is critical. Plan for thorough testing, possibly starting with console
      logs or simple test cases directly within the script during development.
- **Game Flow (5-Card Draw - Single Player vs. House):**
    - Initial deal (5 cards to player, 5 to dealer - dealer cards might be hidden initially).
    - Optional betting round (simplified: e.g., Ante, then Bet or Fold).
    - Player discard/draw phase.
    - Dealer discard/draw phase (can use simple predefined rules, e.g., draw to improve pairs,
      straights, flushes).
    - Optional final betting round.
    - Showdown: Reveal hands, evaluate winner, award pot.
    - Handle game start/reset conditions (e.g., player runs out of chips).
- **State Management:** Maintain variables to track the current game phase (dealing, drawing,
  showdown), player's hand, dealer's hand, player chips, current bet, pot size, and cards remaining
  in the deck.
- **Error Handling:** Add basic checks to prevent invalid actions (e.g., betting more chips than
  available, drawing when not allowed).

### Styling - `style.css`

- **Theme:** Choose a consistent visual theme (e.g., classic casino green felt, minimalist
  dark/light mode). Use CSS custom properties (variables) for colors, fonts, and spacing to make
  theme adjustments easier.
- **Clarity:** Ensure high readability for card ranks/suits, text information (bets, status), and
  button labels.
- **Visual Feedback:** Use CSS transitions or subtle animations for dealing cards, highlighting
  active player/controls, indicating winning hands, and showing chip changes. Avoid overly
  distracting animations.

## Technology Stack

- HTML5 (Semantic markup)
- CSS3 (Flexbox/Grid for layout, Custom Properties, Transitions)
- Vanilla JavaScript (ES6+)

## Getting Started (Placeholder)

_(Instructions on how to open `index.html` in a browser to play the game will be added here once the
basic functionality is implemented.)_

## Future Enhancements (Optional)

- **Texas Hold'em Mode:** Implement the logic for community cards, multiple betting rounds
  (pre-flop, flop, turn, river).
- **Basic AI Opponent:** Develop simple AI logic for betting and drawing decisions (could have
  adjustable difficulty).
- **Sound Effects:** Add subtle sounds for dealing, shuffling, betting, winning/losing.
- **Chip Management:** Implement more realistic betting increments and rules.
- **Persistence:** Use `localStorage` to save player's chip count, maybe basic preferences (theme,
  sound on/off) between sessions.
- **Refined Animations:** Use a lightweight animation library or more advanced CSS for smoother
  visual effects.
- **Code Splitting:** If the `script.js` or `style.css` files become very large, consider splitting
  them into modules/multiple files.
