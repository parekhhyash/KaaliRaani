import { Card, Suit, Rank, PlayedCard } from '@/types/game';
import { SUITS, RANKS, CARD_POINTS, RANK_ORDER } from './constants';

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      const id = `${suit}-${rank}`;
      const points = CARD_POINTS[id] || 0;
      deck.push({
        id,
        suit,
        rank,
        points,
      });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Cryptographically sound or pseudo-random shuffle
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(shuffledDeck: Card[], numPlayers: number = 4): Card[][] {
  const hands: Card[][] = Array.from({ length: numPlayers }, () => []);
  shuffledDeck.forEach((card, index) => {
    hands[index % numPlayers].push(card);
  });

  return hands.map(sortHand);
}

// Order suits: Spades, Hearts, Clubs, Diamonds
const SUIT_SORT_ORDER: Record<Suit, number> = {
  spades: 1,
  hearts: 2,
  clubs: 3,
  diamonds: 4,
};

export function sortHand(hand: Card[]): Card[] {
  return [...hand].sort((a, b) => {
    if (a.suit !== b.suit) {
      return SUIT_SORT_ORDER[a.suit] - SUIT_SORT_ORDER[b.suit];
    }
    return RANK_ORDER[b.rank] - RANK_ORDER[a.rank]; // Descending rank (A -> 2)
  });
}

/**
 * Checks if a player has any cards of a given suit
 */
export function hasSuit(hand: Card[], suit: Suit): boolean {
  return hand.some((c) => c.suit === suit);
}

/**
 * Validates if playing `card` is legal given `leadSuit` and player's `hand`
 */
export function isLegalPlay(card: Card, hand: Card[], leadSuit?: Suit): boolean {
  // If no card has been played yet in this trick, any card is valid
  if (!leadSuit) return true;

  // If the card matches lead suit, it is valid
  if (card.suit === leadSuit) return true;

  // If the card does not match lead suit, it's valid ONLY IF the player has NO cards of lead suit
  return !hasSuit(hand, leadSuit);
}

/**
 * Evaluates the winner of a trick and returns winner's playedCard and total trick points
 */
export function evaluateTrick(
  playedCards: PlayedCard[],
  trumpSuit?: Suit
): { winningPlay: PlayedCard; trickPoints: number } {
  if (playedCards.length === 0) {
    throw new Error('Cannot evaluate empty trick');
  }

  const leadSuit = playedCards[0].card.suit;

  // Calculate trick points
  const trickPoints = playedCards.reduce((sum, p) => sum + p.card.points, 0);

  // Check if any trump cards were played
  const trumpPlays = trumpSuit ? playedCards.filter((p) => p.card.suit === trumpSuit) : [];

  let winningPlay: PlayedCard;

  if (trumpPlays.length > 0) {
    // Highest trump wins
    winningPlay = trumpPlays.reduce((highest, current) => {
      return RANK_ORDER[current.card.rank] > RANK_ORDER[highest.card.rank] ? current : highest;
    }, trumpPlays[0]);
  } else {
    // Highest card of lead suit wins
    const leadPlays = playedCards.filter((p) => p.card.suit === leadSuit);
    winningPlay = leadPlays.reduce((highest, current) => {
      return RANK_ORDER[current.card.rank] > RANK_ORDER[highest.card.rank] ? current : highest;
    }, leadPlays[0]);
  }

  return { winningPlay, trickPoints };
}

/**
 * Helper to get a card by its ID from a full deck
 */
export function getCardById(cardId: string): Card | undefined {
  const [suit, rank] = cardId.split('-') as [Suit, Rank];
  if (!suit || !rank) return undefined;
  return {
    id: cardId,
    suit,
    rank,
    points: CARD_POINTS[cardId] || 0,
  };
}
