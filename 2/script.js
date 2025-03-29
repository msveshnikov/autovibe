/**
 * Poker Game Script
 * Handles game logic for the web-based 5-Card Draw poker game (Player vs. Dealer).
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
const RANK_VALUES = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "T": 10,
  "J": 11,
  "Q": 12,
  "K": 13,
  "A": 14,
};
const HAND_RANKS = {
  ROYAL_FLUSH: { name: "Royal Flush", value: 9 },
  STRAIGHT_FLUSH: { name: "Straight Flush", value: 8 },
  FOUR_OF_A_KIND: { name: "Four of a Kind", value: 7 },
  FULL_HOUSE: { name: "Full House", value: 6 },
  FLUSH: { name: "Flush", value: 5 },
  STRAIGHT: { name: "Straight", value: 4 },
  THREE_OF_A_KIND: { name: "Three of a Kind", value: 3 },
  TWO_PAIR: { name: "Two Pair", value: 2 },
  ONE_PAIR: { name: "One Pair", value: 1 },
  HIGH_CARD: { name: "High Card", value: 0 },
};

// --- Game State Variables ---
let deck = [];
let playerHand = [];
let dealerHand = [];
let playerChips = 1000; // Starting chips
let currentPot = 0; // Pot for the current round (simplified - just reflects win/loss)
let gamePhase = "pre-deal"; // 'pre-deal', 'player-draw-phase', 'dealer-draw-phase', 'showdown', 'round-over'
let selectedCardIndices = []; // Indices of player cards selected for discard

// --- DOM Elements ---
const dealButton = document.getElementById("deal-button");
const drawButton = document.getElementById("draw-button"); // Need to add this button to HTML or repurpose another
const playerHandDiv = document.getElementById("player-hand");
const dealerHandDiv = document.getElementById("dealer-hand");
const potDiv = document.getElementById("pot"); // Changed from span
const playerInfoDiv = document.getElementById("player-info"); // Changed from span
const messageArea = document.getElementById("status-message");
const communityCardArea = document.getElementById("community-card-area");
const bettingControls = document.getElementById("controls"); // Container for betting buttons

// --- Deck Management ---

function createDeck() {
  const newDeck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      newDeck.push({ suit, rank });
    }
  }
  return newDeck;
}

function shuffleDeck(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function dealCards(numCards) {
  if (deck.length < numCards) {
    // In a real game, might reshuffle discards if needed and possible
    setMessage("Error: Not enough cards in the deck!");
    throw new Error("Not enough cards in the deck to deal.");
  }
  return deck.splice(0, numCards);
}

// --- Hand Evaluation ---

function getHandDetails(hand) {
  const values = hand
    .map((card) => RANK_VALUES[card.rank])
    .sort((a, b) => b - a);
  const suits = hand.map((card) => card.suit);
  const rankCounts = values.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
  const suitCounts = suits.reduce((acc, suit) => {
    acc[suit] = (acc[suit] || 0) + 1;
    return acc;
  }, {});
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const isFlush = Object.keys(suitCounts).length === 1;
  // Check for straight, including A-2-3-4-5 (Ace low)
  const uniqueValues = [...new Set(values)];
  let isStraight = false;
  if (uniqueValues.length >= 5) {
    // Need 5 unique ranks for a straight
    isStraight = uniqueValues[0] - uniqueValues[4] === 4;
    // Check for A-5 straight (A, 5, 4, 3, 2) -> values [14, 5, 4, 3, 2]
    if (!isStraight && uniqueValues.toString() === "14,5,4,3,2") {
      isStraight = true;
      // Treat Ace as low for ranking comparison in A-5 straight
      values.splice(values.indexOf(14), 1); // Remove Ace (14)
      values.push(1); // Add Ace as 1
      values.sort((a, b) => b - a); // Re-sort: [5, 4, 3, 2, 1]
    }
  }

  return { values, suits, rankCounts, counts, isFlush, isStraight };
}

function evaluateHand(hand) {
  const { values, counts, isFlush, isStraight } = getHandDetails(hand);

  if (isStraight && isFlush) {
    if (values[0] === 14 && values[1] === 13) {
      // Ace high straight flush
      return { ...HAND_RANKS.ROYAL_FLUSH, sortedValues: values };
    }
    return { ...HAND_RANKS.STRAIGHT_FLUSH, sortedValues: values };
  }
  if (counts[0] === 4) {
    const fourKindValue = parseInt(
      Object.keys(RANK_VALUES).find(
        (key) =>
          RANK_VALUES[key] ===
          parseInt(
            Object.keys(counts).find((rank) => counts[rank] === 4),
            10,
          ),
      ),
      10,
    );
    const kicker = values.find((v) => v !== fourKindValue);
    return {
      ...HAND_RANKS.FOUR_OF_A_KIND,
      sortedValues: [fourKindValue, kicker],
    }; // Simplified values for comparison
  }
  if (counts[0] === 3 && counts[1] === 2) {
    const threeKindValue = parseInt(
      Object.keys(RANK_VALUES).find(
        (key) =>
          RANK_VALUES[key] ===
          parseInt(
            Object.keys(counts).find((rank) => counts[rank] === 3),
            10,
          ),
      ),
      10,
    );
    const pairValue = parseInt(
      Object.keys(RANK_VALUES).find(
        (key) =>
          RANK_VALUES[key] ===
          parseInt(
            Object.keys(counts).find((rank) => counts[rank] === 2),
            10,
          ),
      ),
      10,
    );
    return {
      ...HAND_RANKS.FULL_HOUSE,
      sortedValues: [threeKindValue, pairValue],
    }; // Simplified values
  }
  if (isFlush) {
    return { ...HAND_RANKS.FLUSH, sortedValues: values };
  }
  if (isStraight) {
    return { ...HAND_RANKS.STRAIGHT, sortedValues: values };
  }
  if (counts[0] === 3) {
    const threeKindValue = parseInt(
      Object.keys(RANK_VALUES).find(
        (key) =>
          RANK_VALUES[key] ===
          parseInt(
            Object.keys(counts).find((rank) => counts[rank] === 3),
            10,
          ),
      ),
      10,
    );
    const kickers = values
      .filter((v) => v !== threeKindValue)
      .sort((a, b) => b - a);
    return {
      ...HAND_RANKS.THREE_OF_A_KIND,
      sortedValues: [threeKindValue, ...kickers],
    };
  }
  if (counts[0] === 2 && counts[1] === 2) {
    const pairs = Object.entries(counts)
      .filter(([, count]) => count === 2)
      .map(([rank]) => parseInt(rank, 10))
      .sort((a, b) => b - a);
    const kicker = values.find((v) => !pairs.includes(v));
    return { ...HAND_RANKS.TWO_PAIR, sortedValues: [...pairs, kicker] };
  }
  if (counts[0] === 2) {
    const pairValue = parseInt(
      Object.keys(counts).find((rank) => counts[rank] === 2),
      10,
    );
    const kickers = values
      .filter((v) => v !== pairValue)
      .sort((a, b) => b - a);
    return { ...HAND_RANKS.ONE_PAIR, sortedValues: [pairValue, ...kickers] };
  }
  return { ...HAND_RANKS.HIGH_CARD, sortedValues: values };
}

function compareHands(playerResult, dealerResult) {
  if (playerResult.value > dealerResult.value) return 1;
  if (playerResult.value < dealerResult.value) return -1;

  // Tie in rank, compare kickers (sortedValues)
  for (let i = 0; i < playerResult.sortedValues.length; i++) {
    if (playerResult.sortedValues[i] > dealerResult.sortedValues[i]) return 1;
    if (playerResult.sortedValues[i] < dealerResult.sortedValues[i]) return -1;
  }

  return 0; // Exact tie
}

// --- Game Flow ---

function startRound() {
  gamePhase = "dealing";
  selectedCardIndices = [];
  currentPot = 10; // Example: Simple Ante or base amount
  playerChips -= currentPot / 2; // Player posts Ante
  // Dealer posts Ante implicitly, pot starts with Ante

  deck = createDeck();
  shuffleDeck(deck);

  playerHand = dealCards(5);
  dealerHand = dealCards(5);

  gamePhase = "player-draw-phase";
  setMessage("Select cards to discard (0-5), then click Draw.");
  updateUI();
}

function handleCardClick(event) {
  if (gamePhase !== "player-draw-phase") return;

  const cardElement = event.currentTarget; // The div that was clicked
  const index = parseInt(cardElement.dataset.cardIndex, 10);

  if (selectedCardIndices.includes(index)) {
    // Deselect
    selectedCardIndices = selectedCardIndices.filter((i) => i !== index);
    cardElement.classList.remove("selected");
  } else {
    // Select
    if (selectedCardIndices.length < 5) {
      selectedCardIndices.push(index);
      cardElement.classList.add("selected");
    }
  }
  // Update Draw button text/state if needed (e.g., "Draw X Cards")
}

function playerDraw() {
  if (gamePhase !== "player-draw-phase") return;

  const numToDraw = selectedCardIndices.length;

  // Remove discarded cards (from highest index to lowest to avoid shifting)
  selectedCardIndices.sort((a, b) => b - a);
  selectedCardIndices.forEach((index) => {
    playerHand.splice(index, 1);
  });

  // Deal new cards
  const newCards = dealCards(numToDraw);
  playerHand.push(...newCards);

  selectedCardIndices = []; // Clear selection
  gamePhase = "dealer-draw-phase";
  setMessage("Dealer is drawing...");
  updateUI(); // Update player hand, disable clicks/draw button

  // Simulate dealer thinking/drawing
  setTimeout(dealerTurn, 1500); // Wait 1.5 seconds
}

function dealerTurn() {
  if (gamePhase !== "dealer-draw-phase") return;

  // Simple Dealer AI: Keep pairs or better, discard others. Draw to straights/flushes.
  const dealerResult = evaluateHand(dealerHand);
  let discardIndices = [];

  if (dealerResult.value < HAND_RANKS.ONE_PAIR.value) {
    // No pair or better, keep highest card, discard others (simple strategy)
    const handValues = getHandDetails(dealerHand).values;
    const highestValue = handValues[0];
    dealerHand.forEach((card, index) => {
      if (RANK_VALUES[card.rank] !== highestValue) {
        discardIndices.push(index);
      }
    });
    // Limit discards if keeping more than 1 high card makes sense (not implemented here)
    if (discardIndices.length > 3) {
      // Keep top 2 if discarding 4 or 5? More complex logic needed.
      // Simple: Just keep highest, discard up to 4.
      discardIndices = discardIndices.slice(0, 4);
    }
  } else if (dealerResult.value === HAND_RANKS.ONE_PAIR.value) {
    // Keep the pair, discard the other 3
    const pairValue = dealerResult.sortedValues[0];
    dealerHand.forEach((card, index) => {
      if (RANK_VALUES[card.rank] !== pairValue) {
        discardIndices.push(index);
      }
    });
  } else if (dealerResult.value === HAND_RANKS.TWO_PAIR.value) {
    // Keep two pairs, discard the 5th card
    const pairValues = dealerResult.sortedValues.slice(0, 2);
    const kickerIndex = dealerHand.findIndex(
      (card) => !pairValues.includes(RANK_VALUES[card.rank]),
    );
    if (kickerIndex !== -1) discardIndices.push(kickerIndex);
  } else if (dealerResult.value === HAND_RANKS.THREE_OF_A_KIND.value) {
    // Keep three of a kind, discard the other 2
    const threeKindValue = dealerResult.sortedValues[0];
    dealerHand.forEach((card, index) => {
      if (RANK_VALUES[card.rank] !== threeKindValue) {
        discardIndices.push(index);
      }
    });
  }
  // Straights, Flushes, Full Houses, Four of a Kind: Stand pat (keep all 5)

  // Discard and draw for dealer
  discardIndices.sort((a, b) => b - a); // Sort high to low for safe splicing
  discardIndices.forEach((index) => {
    dealerHand.splice(index, 1);
  });

  const dealerNewCards = dealCards(discardIndices.length);
  dealerHand.push(...dealerNewCards);

  gamePhase = "showdown";
  setTimeout(showdown, 500); // Short delay before showing results
}

function showdown() {
  if (gamePhase !== "showdown") return;

  const playerResult = evaluateHand(playerHand);
  const dealerResult = evaluateHand(dealerHand);
  const winner = compareHands(playerResult, dealerResult);

  let message = `Player has: ${playerResult.name}. Dealer has: ${
    dealerResult.name
  }. `;

  if (winner === 1) {
    message += "Player wins!";
    playerChips += currentPot; // Player wins the pot
  } else if (winner === -1) {
    message += "Dealer wins.";
    // Player loses their ante, chips already deducted
  } else {
    message += "It's a tie! (Push)";
    playerChips += currentPot / 2; // Return player's ante
  }

  currentPot = 0; // Reset pot for next round
  gamePhase = "round-over";
  setMessage(message);
  updateUI(true); // Show dealer's hand

  if (playerChips <= 0) {
    setMessage(`Game Over! You ran out of chips. Final Score: ${playerChips}`);
    // Disable deal button or implement reset game logic
    dealButton.disabled = true;
    drawButton.disabled = true;
  }
}

// --- UI Updates ---

function updateUI(showDealerFullHand = false) {
  // Update player hand display
  playerHandDiv.innerHTML = formatCards(
    playerHand,
    true,
    gamePhase === "player-draw-phase",
  );

  // Update dealer hand display
  dealerHandDiv.innerHTML = formatCards(
    dealerHand,
    showDealerFullHand || gamePhase === "showdown" || gamePhase === "round-over",
  );

  // Update pot and chips display
  potDiv.textContent = `Pot: $${currentPot}`;
  playerInfoDiv.textContent = `Chips: $${playerChips}`;

  // Update button states
  dealButton.disabled = gamePhase !== "pre-deal" && gamePhase !== "round-over";
  drawButton.disabled = gamePhase !== "player-draw-phase";

  // Hide betting controls and community cards for 5-card draw
  communityCardArea.style.display = "none";
  // Keep betting controls hidden or disabled as they aren't used yet
  Array.from(bettingControls.children).forEach((btn) => {
    if (btn.id !== "deal-button" && btn.id !== "draw-button") {
      btn.style.display = "none";
    }
  });
  // Ensure Draw button exists and is visible when needed
  if (!drawButton) {
    console.error("Draw button not found in HTML!");
  } else {
    drawButton.style.display =
      gamePhase === "player-draw-phase" ? "inline-block" : "none";
  }

  // Add/Remove card click listeners
  const playerCards = playerHandDiv.querySelectorAll(".card");
  playerCards.forEach((card, index) => {
    // Remove any old listener first
    card.removeEventListener("click", handleCardClick);
    card.style.cursor = "default"; // Reset cursor

    if (gamePhase === "player-draw-phase") {
      card.dataset.cardIndex = index; // Ensure index is set
      card.style.cursor = "pointer";
      card.addEventListener("click", handleCardClick);
      // Re-apply selected class if needed (e.g., after redraw)
      if (selectedCardIndices.includes(index)) {
        card.classList.add("selected");
      } else {
        card.classList.remove("selected");
      }
    } else {
      card.classList.remove("selected"); // Ensure not selected visually outside draw phase
    }
  });
}

function setMessage(text) {
  messageArea.textContent = text;
}

function formatCards(hand, showAll = true, isPlayerTurn = false) {
  let html = "";
  if (!hand || hand.length === 0) {
    // Placeholder for empty hand
    return '<div class="card placeholder"></div>'.repeat(5);
  }

  hand.forEach((card, index) => {
    const isRed = card.suit === "♥" || card.suit === "♦";
    const colorClass = isRed ? "hearts diamonds" : "spades clubs"; // Use suit name classes for potential specific styling
    const cardValue = card.rank === "T" ? "10" : card.rank; // Display '10' instead of 'T'

    if (showAll) {
      html += `
        <div class="card ${colorClass}" ${
        isPlayerTurn ? `data-card-index="${index}"` : ""
      }>
          <span class="value">${cardValue}</span>
          <span class="suit">${card.suit}</span>
        </div>`;
    } else {
      // Show card back
      html += '<div class="card back"></div> ';
    }
  });
  // Add placeholders if hand has less than 5 cards (e.g., during draw)
  // html += '<div class="card placeholder"></div>'.repeat(Math.max(0, 5 - hand.length));

  return html.trim();
}

// --- Event Listeners ---

dealButton.addEventListener("click", startRound);
// Add Draw button to HTML: <button id="draw-button" disabled>Draw</button>
// Find or create the Draw button element reference
const drawBtnElement = document.getElementById("draw-button");
if (drawBtnElement) {
  drawButton = drawBtnElement; // Assign if found
  drawButton.addEventListener("click", playerDraw);
} else {
  // Optionally create it dynamically if needed, or rely on it being in HTML
  console.warn(
    "Draw button element with id 'draw-button' not found in HTML. Creating one.",
  );
  drawButton = document.createElement("button");
  drawButton.id = "draw-button";
  drawButton.textContent = "Draw";
  drawButton.disabled = true;
  // Insert it after the Deal button for example
  dealButton.parentNode.insertBefore(drawButton, dealButton.nextSibling);
  drawButton.addEventListener("click", playerDraw);
}

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("Poker game script loaded.");
  setMessage("Welcome to 5-Card Draw! Click Deal to start.");
  gamePhase = "pre-deal"; // Ensure correct initial state
  updateUI(); // Initial UI setup
});