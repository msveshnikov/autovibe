/**
 * Poker Game Script
 * Handles game logic for the web-based poker game.
 */

// --- Constants ---
const SUITS = ["♠", "♥", "♦", "♣"]; // Spades, Hearts, Diamonds, Clubs
const RANKS = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A",
]; // T=10, J=Jack, Q=Queen, K=King, A=Ace

// --- Game State Variables ---
let deck = [];
let playerHand = [];
let dealerHand = []; // Or community cards depending on the game variant
let pot = 0;
let playerChips = 1000; // Starting chips
let currentBet = 0;
let gamePhase = "pre-deal"; // e.g., 'pre-deal', 'flop', 'turn', 'river', 'showdown'

// --- DOM Elements (Placeholders - will need actual IDs/Classes from HTML) ---
// const dealButton = document.getElementById('deal-button');
// const checkButton = document.getElementById('check-button');
// const betButton = document.getElementById('bet-button');
// const callButton = document.getElementById('call-button');
// const raiseButton = document.getElementById('raise-button');
// const foldButton = document.getElementById('fold-button');
// const playerHandDiv = document.getElementById('player-hand');
// const dealerHandDiv = document.getElementById('dealer-hand'); // Or community cards div
// const potAmountSpan = document.getElementById('pot-amount');
// const playerChipsSpan = document.getElementById('player-chips');
// const messageArea = document.getElementById('message-area');

// --- Deck Management ---

/**
 * Creates a standard 52-card deck.
 * @returns {Array<Object>} An array of card objects, e.g., { suit: '♠', rank: 'A' }
 */
function createDeck() {
  const newDeck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      newDeck.push({
        suit,
        rank
      });
    }
  }
  return newDeck;
}

/**
 * Shuffles an array in place using the Fisher-Yates (Knuth) algorithm.
 * @param {Array} array The array to shuffle.
 */
function shuffleDeck(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}

/**
 * Deals a specified number of cards from the deck.
 * @param {number} numCards - The number of cards to deal.
 * @returns {Array<Object>} An array of card objects dealt from the deck.
 * @throws {Error} If the deck doesn't have enough cards.
 */
function dealCards(numCards) {
  if (deck.length < numCards) {
    // Or reshuffle discard pile if implementing longer games
    throw new Error("Not enough cards in the deck to deal.");
  }
  return deck.splice(0, numCards); // Removes cards from the start of the deck
}

// --- Hand Evaluation (Placeholders) ---

/**
 * Evaluates a poker hand to determine its rank.
 * @param {Array<Object>} hand - An array of card objects.
 * @returns {Object} An object describing the hand rank (e.g., { rankName: 'Flush', rankValue: 5, highCards: [...] }).
 */
function evaluateHand(hand) {
  // TODO: Implement hand evaluation logic (Pair, Two Pair, Flush, Straight, etc.)
  console.log("Evaluating hand:", hand);
  // Placeholder return
  return {
    rankName: "High Card",
    rankValue: 0,
    highCards: []
  };
}

/**
 * Compares two evaluated poker hands to determine the winner.
 * @param {Object} hand1Result - The result from evaluateHand for the first hand.
 * @param {Object} hand2Result - The result from evaluateHand for the second hand.
 * @returns {number} 1 if hand1 wins, -1 if hand2 wins, 0 for a tie.
 */
function compareHands(hand1Result, hand2Result) {
  // TODO: Implement hand comparison logic based on rank and high cards.
  console.log("Comparing hands:", hand1Result, hand2Result);
  // Placeholder return
  return 0;
}

// --- Game Flow (Placeholders) ---

/**
 * Starts a new round of the game.
 */
function startRound() {
  console.log("Starting new round...");
  gamePhase = "pre-deal";
  pot = 0;
  currentBet = 0;
  playerHand = [];
  dealerHand = []; // Reset hands/community cards

  deck = createDeck();
  shuffleDeck(deck);

  // TODO: Implement initial dealing based on game variant (e.g., 2 cards for Hold'em, 5 for Draw)
  // Example for 5-Card Draw (single player):
  // playerHand = dealCards(5);
  // gamePhase = 'player-turn'; // Or betting phase

  updateUI(); // Update the display
  setMessage("New round started. Place your bets or deal."); // Example message
}

/**
 * Handles the player's betting action.
 * @param {number} amount - The amount to bet or raise.
 */
function playerBet(amount) {
  if (amount > playerChips) {
    setMessage("Not enough chips!");
    return;
  }
  if (gamePhase !== "betting") {
    // Example phase check
    setMessage("Cannot bet at this time.");
    return;
  }
  // TODO: Implement betting logic (handle calls, raises, minimum bets)
  console.log(`Player bets ${amount}`);
  playerChips -= amount;
  pot += amount;
  currentBet = amount; // Simplistic betting for now
  // TODO: Advance game phase or trigger dealer/AI action
  updateUI();
}

/**
 * Handles the player's check action.
 */
function playerCheck() {
  if (gamePhase !== "betting" || currentBet > 0) {
    // Can only check if no bet has been made yet in this round
    setMessage("Cannot check now.");
    return;
  }
  console.log("Player checks");
  // TODO: Advance game phase or trigger dealer/AI action
  updateUI();
}

/**
 * Handles the player's fold action.
 */
function playerFold() {
  console.log("Player folds");
  // TODO: End the round, award pot to the opponent (if any)
  // For single player, maybe just end the round immediately.
  setMessage("You folded.");
  gamePhase = "round-over";
  // Award pot to dealer/house or just reset for next round? Decide game rules.
  // startRound(); // Option: Immediately start next round
  updateUI(); // Disable buttons etc.
}

// --- UI Updates ---

/**
 * Updates the UI elements based on the current game state.
 */
function updateUI() {
  console.log("Updating UI...");
  // Update player hand display
  // if (playerHandDiv) playerHandDiv.innerHTML = formatCards(playerHand);

  // Update dealer hand display (might need hiding logic depending on game phase)
  // if (dealerHandDiv) dealerHandDiv.innerHTML = formatCards(dealerHand, gamePhase === 'showdown');

  // Update pot and chips display
  // if (potAmountSpan) potAmountSpan.textContent = pot;
  // if (playerChipsSpan) playerChipsSpan.textContent = playerChips;

  // TODO: Enable/disable action buttons based on gamePhase and currentBet
  // Example:
  // dealButton.disabled = gamePhase !== 'pre-deal';
  // checkButton.disabled = !(gamePhase === 'betting' && currentBet === 0);
  // foldButton.disabled = gamePhase === 'pre-deal' || gamePhase === 'round-over';
  // ... etc.
}

/**
 * Displays a message to the player.
 * @param {string} text - The message to display.
 */
function setMessage(text) {
  console.log("Message:", text);
  // if (messageArea) {
  //   messageArea.textContent = text;
  // }
}

/**
 * Formats an array of cards into a string for display.
 * @param {Array<Object>} hand - The array of card objects.
 * @param {boolean} [showAll=true] - Whether to show all cards or hide some (e.g., dealer's hole cards).
 * @returns {string} HTML string representing the cards.
 */
function formatCards(hand, showAll = true) {
  let html = "";
  hand.forEach((card, index) => {
    let cardRepresentation = "?"; // Default hidden card
    if (showAll || index < 1) {
      // Example: Always show the first card, or all if showAll is true
      // Use Unicode characters or placeholder text
      cardRepresentation = `${card.rank}${card.suit}`;
    }
    // Basic text representation, replace with styled divs or images later
    html += `<span class="card ${card.suit === '♥' || card.suit === '♦' ? 'red' : ''}">${cardRepresentation}</span> `;
  });
  return html.trim();
}

// --- Event Listeners (Placeholders) ---

// dealButton?.addEventListener('click', startRound);
// checkButton?.addEventListener('click', playerCheck);
// foldButton?.addEventListener('click', playerFold);
// betButton?.addEventListener('click', () => {
//   const betAmount = parseInt(prompt("Enter bet amount:", "10"), 10); // Simple prompt for now
//   if (!isNaN(betAmount) && betAmount > 0) {
//     playerBet(betAmount);
//   } else {
//     setMessage("Invalid bet amount.");
//   }
// });
// callButton?.addEventListener('click', () => playerBet(currentBet)); // Simple call logic
// raiseButton?.addEventListener('click', () => {
//    const raiseAmount = parseInt(prompt(`Enter amount to raise (current bet is ${currentBet}):`, "20"), 10);
//    if (!isNaN(raiseAmount) && raiseAmount > 0) {
//       playerBet(currentBet + raiseAmount); // Simple raise logic
//    } else {
//      setMessage("Invalid raise amount.");
//    }
// });

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("Poker game script loaded.");
  // Initialize the game state on page load (optional, could be triggered by a button)
  // startRound(); // Start the first round automatically? Or wait for user action.
  setMessage(
    "Welcome to Poker! Click 'Deal' (when implemented) to start.",
  );
  updateUI(); // Initial UI setup
});