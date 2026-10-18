import { Suit, Rank, GameSettings } from '@/types/game';

export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];

export const RANKS: Rank[] = [
  '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'
];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

export const SUIT_NAMES: Record<Suit, string> = {
  spades: 'Spades (Hukum)',
  hearts: 'Hearts (Paan)',
  diamonds: 'Diamonds (Charkat)',
  clubs: 'Clubs (Chidi)',
};

// Points per card in Kaali Raani:
// ♠Q = 30
// Aces = 15 each (4 * 15 = 60)
// 10s = 10 each (4 * 10 = 40)
// 5s = 5 each (4 * 5 = 20)
// Total in deck = 150 points
export const CARD_POINTS: Record<string, number> = {
  'spades-Q': 30, // Kaali Raani
  'spades-A': 15,
  'hearts-A': 15,
  'diamonds-A': 15,
  'clubs-A': 15,
  'spades-10': 10,
  'hearts-10': 10,
  'diamonds-10': 10,
  'clubs-10': 10,
  'spades-5': 5,
  'hearts-5': 5,
  'diamonds-5': 5,
  'clubs-5': 5,
};

export const RANK_ORDER: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14,
};

export const DEFAULT_SETTINGS: GameSettings = {
  totalRounds: 3,
  minBid: 70,
  bidIncrement: 5,
  maxBid: 150,
  autoFillBots: false,
  maxPlayers: 4,
};

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;
export const ROOM_INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
