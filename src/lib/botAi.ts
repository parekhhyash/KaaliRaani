import { Card, Suit, Player, RoomState, Rank } from '@/types/game';
import { SUITS, RANK_ORDER, CARD_POINTS } from './constants';
import { isLegalPlay } from './deck';

/**
 * Calculates approximate bidding power of a bot's hand
 */
export function evaluateBotBid(hand: Card[], currentHighestBid: number, minBid: number): number | null {
  let score = 0;

  // Count high cards and Kaali Raani
  for (const card of hand) {
    if (card.id === 'spades-Q') score += 25;
    if (card.rank === 'A') score += 12;
    if (card.rank === 'K') score += 8;
    if (card.rank === 'Q' && card.id !== 'spades-Q') score += 4;
    if (card.rank === '10') score += 6;
  }

  // Count suit lengths (long suit advantage)
  const suitCounts: Record<Suit, number> = { spades: 0, hearts: 0, diamonds: 0, clubs: 0 };
  for (const card of hand) {
    suitCounts[card.suit]++;
  }
  const maxSuitLength = Math.max(...Object.values(suitCounts));
  score += maxSuitLength * 3;

  // Maximum bid bot is willing to place:
  // Baseline 70 + fraction of strength
  const botMaxWillingBid = Math.min(105, Math.floor((65 + score * 0.45) / 5) * 5);

  const targetBid = currentHighestBid === 0 ? minBid : currentHighestBid + 5;

  if (targetBid <= botMaxWillingBid) {
    return targetBid;
  }
  return null; // Pass
}

/**
 * Decides trump suit and partner card for bot when bot wins auction
 */
export function botChooseTrumpAndPartner(hand: Card[]): { trumpSuit: Suit; calledCard: Card } {
  // Trump: suit with highest count
  const suitCounts: Record<Suit, number> = { spades: 0, hearts: 0, diamonds: 0, clubs: 0 };
  for (const card of hand) {
    suitCounts[card.suit]++;
  }

  let bestSuit: Suit = 'spades';
  let bestCount = -1;
  for (const suit of SUITS) {
    if (suitCounts[suit] > bestCount) {
      bestCount = suitCounts[suit];
      bestSuit = suit;
    }
  }

  // Partner Card:
  // 1. Call ♠Q if not in hand
  const hasSpadeQueen = hand.some((c) => c.id === 'spades-Q');
  if (!hasSpadeQueen && bestSuit !== 'spades') {
    return {
      trumpSuit: bestSuit,
      calledCard: { id: 'spades-Q', suit: 'spades', rank: 'Q', points: 30 },
    };
  }

  // 2. Otherwise, find an Ace of an off-suit not in bot's hand
  for (const suit of SUITS) {
    if (suit !== bestSuit) {
      const hasAce = hand.some((c) => c.suit === suit && c.rank === 'A');
      if (!hasAce) {
        return {
          trumpSuit: bestSuit,
          calledCard: { id: `${suit}-A`, suit, rank: 'A', points: 15 },
        };
      }
    }
  }

  // 3. Any Ace not in bot's hand
  for (const suit of SUITS) {
    const hasAce = hand.some((c) => c.suit === suit && c.rank === 'A');
    if (!hasAce) {
      return {
        trumpSuit: bestSuit,
        calledCard: { id: `${suit}-A`, suit, rank: 'A', points: 15 },
      };
    }
  }

  // 4. Any high card not in bot's hand
  const candidateRanks: Rank[] = ['K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
  for (const r of candidateRanks) {
    for (const s of SUITS) {
      const cardId = `${s}-${r}`;
      if (!hand.some((c) => c.id === cardId)) {
        return {
          trumpSuit: bestSuit,
          calledCard: {
            id: cardId,
            suit: s,
            rank: r,
            points: CARD_POINTS[cardId] || 0,
          },
        };
      }
    }
  }

  // Ultimate fallback (guaranteed never reached with <= 26 cards in hand)
  return {
    trumpSuit: bestSuit,
    calledCard: { id: `${bestSuit}-K`, suit: bestSuit, rank: 'K', points: 0 },
  };
}

/**
 * Selects the best card for bot to play in current trick
 */
export function botChooseCardToPlay(bot: Player, state: RoomState): Card {
  const leadSuit = state.currentTrick.leadSuit;
  const legalCards = bot.hand.filter((card) => isLegalPlay(card, bot.hand, leadSuit));

  if (legalCards.length === 0) {
    return bot.hand[0]; // safety
  }

  // 1. If bot is leading the trick (first to play)
  if (!leadSuit) {
    // Lead an Ace if available
    const ace = legalCards.find((c) => c.rank === 'A');
    if (ace) return ace;

    // Avoid leading ♠Q early if possible
    const safeCards = legalCards.filter((c) => c.id !== 'spades-Q');
    if (safeCards.length > 0) {
      // Lead a low rank card of longest suit
      return safeCards[Math.floor(Math.random() * safeCards.length)];
    }
    return legalCards[0];
  }

  // 2. Following suit:
  const followingCards = legalCards.filter((c) => c.suit === leadSuit);
  if (followingCards.length > 0) {
    // If trick has high points (like ♠Q or Aces) and bot has higher card, play highest
    const trickPoints = state.currentTrick.cards.reduce((sum, p) => sum + p.card.points, 0);
    if (trickPoints >= 15) {
      // Play highest legal card to try to take the points
      followingCards.sort((a, b) => RANK_ORDER[b.rank] - RANK_ORDER[a.rank]);
      return followingCards[0];
    }

    // Otherwise play lowest card of the suit to conserve power
    followingCards.sort((a, b) => RANK_ORDER[a.rank] - RANK_ORDER[b.rank]);
    return followingCards[0];
  }

  // 3. Cannot follow suit:
  // Check if we have trump cards
  const trumpSuit = state.trumpSuit;
  const trumpCards = trumpSuit ? legalCards.filter((c) => c.suit === trumpSuit) : [];

  // If there are points in trick and we can trump:
  const trickPoints = state.currentTrick.cards.reduce((sum, p) => sum + p.card.points, 0);
  if (trumpCards.length > 0 && trickPoints >= 10) {
    // Trump with lowest trump
    trumpCards.sort((a, b) => RANK_ORDER[a.rank] - RANK_ORDER[b.rank]);
    return trumpCards[0];
  }

  // Discard a safe card (lowest rank, lowest points, preferably avoid discarding ♠Q into opponent trick)
  const nonPoints = legalCards.filter((c) => c.points === 0);
  if (nonPoints.length > 0) {
    nonPoints.sort((a, b) => RANK_ORDER[a.rank] - RANK_ORDER[b.rank]);
    return nonPoints[0];
  }

  // Lowest rank overall
  legalCards.sort((a, b) => RANK_ORDER[a.rank] - RANK_ORDER[b.rank]);
  return legalCards[0];
}
