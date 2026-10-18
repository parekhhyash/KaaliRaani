export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export type Rank =
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'
  | 'A';

export interface Card {
  id: string; // e.g. "spades-Q"
  suit: Suit;
  rank: Rank;
  points: number; // 30 for ♠Q, 15 for Aces, 10 for 10s, 5 for 5s, 0 for others
}

export interface Player {
  id: string; // unique peer ID / player ID
  username: string;
  isHost: boolean;
  isBot: boolean;
  isReady: boolean;
  isConnected: boolean;
  hand: Card[];
  seatIndex: number; // 0, 1, 2, 3
  hasPassedBid: boolean;
  currentBid: number; // 0 if haven't bid or passed
  tricksWon: number;
  cardPointsCollected: number; // card points in this round
  matchScore: number; // cumulative match leaderboard score
  team?: 'declarer' | 'opposition'; // revealed or assigned at round end
}

export type GamePhase =
  | 'lobby'
  | 'bidding'
  | 'trump_selection' // Declarer chooses trump and partner card
  | 'playing'
  | 'round_end'
  | 'match_end';

export interface PlayedCard {
  playerId: string;
  playerUsername: string;
  card: Card;
  seatIndex: number;
}

export interface Trick {
  trickNumber: number; // 1 to 13
  leadPlayerId: string;
  leadSuit?: Suit;
  cards: PlayedCard[];
  winnerPlayerId?: string;
  winnerUsername?: string;
  trickPoints?: number;
}

export interface RoundResult {
  roundNumber: number;
  declarerId: string;
  declarerUsername: string;
  partnerId: string;
  partnerUsername: string;
  calledCard: Card;
  trumpSuit: Suit;
  bidAmount: number;
  declarerTeamPoints: number;
  oppositionTeamPoints: number;
  biddingTeamWon: boolean;
  pointsAwarded: number; // equal to bidAmount
  scoresAfterRound: { [playerId: string]: number };
}

export interface GameSettings {
  totalRounds: number;
  minBid: number; // 70
  bidIncrement: number; // 5
  maxBid: number; // 150
  autoFillBots: boolean;
  maxPlayers: number; // 2 to 6 players
}

export interface GameActionLog {
  id: string;
  timestamp: number;
  text: string;
  type: 'bid' | 'trump' | 'partner' | 'play' | 'trick' | 'round' | 'system';
}

export interface RoomState {
  roomCode: string;
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  totalTricks: number; // dynamically computed based on player count
  players: Player[];
  settings: GameSettings;
  
  // Bidding phase
  currentBidderId?: string;
  highestBid: number;
  highestBidderId?: string;
  
  // Declarer & Trump
  declarerId?: string;
  trumpSuit?: Suit;
  calledCard?: Card;
  isPartnerRevealed: boolean;
  partnerId?: string; // known by engine, revealed to players when card is played

  // Playing phase
  currentTurnPlayerId?: string;
  currentTrick: Trick;
  previousTrick?: Trick;
  completedTricks: Trick[];

  // History & Results
  roundResults: RoundResult[];
  actionLogs: GameActionLog[];

  // Inactivity & Sync version
  lastActiveAt: number;
  updatedAt: number;
}

export type P2PMessage =
  | { type: 'JOIN_REQUEST'; username: string; playerId: string; isHost: boolean }
  | { type: 'SYNC_STATE'; state: RoomState }
  | { type: 'PLAYER_RECONNECT'; username: string; playerId: string }
  | { type: 'START_GAME' }
  | { type: 'PLACE_BID'; playerId: string; amount: number }
  | { type: 'PASS_BID'; playerId: string }
  | { type: 'SELECT_TRUMP_AND_PARTNER'; playerId: string; trumpSuit: Suit; calledCard: Card }
  | { type: 'PLAY_CARD'; playerId: string; cardId: string }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESTART_GAME' }
  | { type: 'ADD_BOT' }
  | { type: 'REMOVE_BOT'; playerId: string }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<GameSettings> }
  | { type: 'CHAT_MESSAGE'; username: string; text: string; timestamp: number };
