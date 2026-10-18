import {
  Card,
  Suit,
  Player,
  RoomState,
  Trick,
  PlayedCard,
  RoundResult,
  GameSettings,
} from '@/types/game';
import { DEFAULT_SETTINGS, MAX_PLAYERS } from './constants';
import { createDeck, shuffleDeck, dealCards, isLegalPlay, evaluateTrick } from './deck';

export function createInitialRoomState(
  roomCode: string,
  hostPlayer: { id: string; username: string },
  settings: Partial<GameSettings> = {}
): RoomState {
  const mergedSettings: GameSettings = { ...DEFAULT_SETTINGS, ...settings };

  const host: Player = {
    id: hostPlayer.id,
    username: hostPlayer.username,
    isHost: true,
    isBot: false,
    isReady: true,
    isConnected: true,
    hand: [],
    seatIndex: 0,
    hasPassedBid: false,
    currentBid: 0,
    tricksWon: 0,
    cardPointsCollected: 0,
    matchScore: 0,
  };

  return {
    roomCode,
    phase: 'lobby',
    currentRound: 0,
    totalRounds: mergedSettings.totalRounds,
    totalTricks: 13,
    players: [host],
    settings: mergedSettings,
    highestBid: 0,
    isPartnerRevealed: false,
    currentTrick: { trickNumber: 1, leadPlayerId: '', cards: [] },
    completedTricks: [],
    roundResults: [],
    actionLogs: [
      {
        id: `log-${Date.now()}-0`,
        timestamp: Date.now(),
        text: `Room created by ${hostPlayer.username}. Code: ${roomCode}`,
        type: 'system',
      },
    ],
    lastActiveAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function addPlayerToRoom(state: RoomState, playerInfo: { id: string; username: string }): RoomState {
  const maxAllowed = state.settings.maxPlayers || MAX_PLAYERS;
  if (state.players.length >= maxAllowed) {
    // Check if player is rejoining with same username
    const existing = state.players.find(
      (p) => p.username.trim().toLowerCase() === playerInfo.username.trim().toLowerCase()
    );
    if (existing) {
      return reconnectPlayer(state, playerInfo.username, playerInfo.id);
    }
    throw new Error('Room is already full');
  }

  // Check duplicate username
  const existingSameName = state.players.find(
    (p) => p.username.trim().toLowerCase() === playerInfo.username.trim().toLowerCase()
  );
  if (existingSameName) {
    return reconnectPlayer(state, playerInfo.username, playerInfo.id);
  }

  const newPlayer: Player = {
    id: playerInfo.id,
    username: playerInfo.username,
    isHost: false,
    isBot: false,
    isReady: false,
    isConnected: true,
    hand: [],
    seatIndex: state.players.length,
    hasPassedBid: false,
    currentBid: 0,
    tricksWon: 0,
    cardPointsCollected: 0,
    matchScore: 0,
  };

  return {
    ...state,
    players: [...state.players, newPlayer],
    actionLogs: [
      ...state.actionLogs,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        text: `${playerInfo.username} joined the room.`,
        type: 'system',
      },
    ],
    lastActiveAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function reconnectPlayer(state: RoomState, username: string, newId: string): RoomState {
  const playerIndex = state.players.findIndex(
    (p) => p.username.trim().toLowerCase() === username.trim().toLowerCase()
  );

  if (playerIndex === -1) {
    return state;
  }

  const oldId = state.players[playerIndex].id;
  const updatedPlayers = [...state.players];
  updatedPlayers[playerIndex] = {
    ...updatedPlayers[playerIndex],
    id: newId,
    isConnected: true,
  };

  // Update current turn / bidder / declarer / partner IDs if matched
  const currentBidderId = state.currentBidderId === oldId ? newId : state.currentBidderId;
  const highestBidderId = state.highestBidderId === oldId ? newId : state.highestBidderId;
  const declarerId = state.declarerId === oldId ? newId : state.declarerId;
  const partnerId = state.partnerId === oldId ? newId : state.partnerId;
  const currentTurnPlayerId = state.currentTurnPlayerId === oldId ? newId : state.currentTurnPlayerId;

  return {
    ...state,
    players: updatedPlayers,
    currentBidderId,
    highestBidderId,
    declarerId,
    partnerId,
    currentTurnPlayerId,
    actionLogs: [
      ...state.actionLogs,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        text: `${username} reconnected.`,
        type: 'system',
      },
    ],
    lastActiveAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function addBotPlayer(state: RoomState): RoomState {
  const maxAllowed = state.settings.maxPlayers || MAX_PLAYERS;
  if (state.players.length >= maxAllowed) {
    return state;
  }

  const botIndex = state.players.filter((p) => p.isBot).length + 1;
  const botNames = ['Bot Vikram', 'Bot Ananya', 'Bot Kabir', 'Bot Priya', 'Bot Rahul', 'Bot Aryan'];
  const name = botNames[botIndex - 1] || `Bot ${botIndex}`;

  const botPlayer: Player = {
    id: `bot-${Date.now()}-${botIndex}`,
    username: name,
    isHost: false,
    isBot: true,
    isReady: true,
    isConnected: true,
    hand: [],
    seatIndex: state.players.length,
    hasPassedBid: false,
    currentBid: 0,
    tricksWon: 0,
    cardPointsCollected: 0,
    matchScore: 0,
  };

  return {
    ...state,
    players: [...state.players, botPlayer],
    actionLogs: [
      ...state.actionLogs,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        text: `${botPlayer.username} was added to the game.`,
        type: 'system',
      },
    ],
    lastActiveAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function removeBotPlayer(state: RoomState, botId: string): RoomState {
  const filtered = state.players.filter((p) => p.id !== botId);
  const reindexed = filtered.map((p, idx) => ({ ...p, seatIndex: idx }));

  return {
    ...state,
    players: reindexed,
    lastActiveAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function startRound(state: RoomState, roundNumber: number): RoomState {
  const numPlayers = state.players.length;
  // Deal cards to all players
  const deck = createDeck();
  const shuffled = shuffleDeck(deck);
  const { hands, totalTricks } = dealCards(shuffled, numPlayers);

  const updatedPlayers: Player[] = state.players.map((p, index) => ({
    ...p,
    hand: hands[index] || [],
    hasPassedBid: false,
    currentBid: 0,
    tricksWon: 0,
    cardPointsCollected: 0,
    team: undefined,
  }));

  // First bidder rotates with round
  const startingBidderIndex = (roundNumber - 1) % numPlayers;
  const startingBidder = updatedPlayers[startingBidderIndex];

  return {
    ...state,
    phase: 'bidding',
    currentRound: roundNumber,
    totalTricks,
    players: updatedPlayers,
    highestBid: 0,
    highestBidderId: undefined,
    currentBidderId: startingBidder.id,
    declarerId: undefined,
    trumpSuit: undefined,
    calledCard: undefined,
    partnerId: undefined,
    isPartnerRevealed: false,
    currentTurnPlayerId: undefined,
    currentTrick: { trickNumber: 1, leadPlayerId: '', cards: [] },
    previousTrick: undefined,
    completedTricks: [],
    actionLogs: [
      ...state.actionLogs,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        text: `--- Round ${roundNumber} of ${state.totalRounds} Started ---`,
        type: 'round',
      },
      {
        id: `log-${Date.now()}-bid`,
        timestamp: Date.now(),
        text: `Bidding started. First bid goes to ${startingBidder.username} (min bid: ${state.settings.minBid}).`,
        type: 'bid',
      },
    ],
    lastActiveAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function placeBid(state: RoomState, playerId: string, amount: number): RoomState {
  if (state.phase !== 'bidding') return state;
  if (state.currentBidderId !== playerId) return state;

  const player = state.players.find((p) => p.id === playerId);
  if (!player || player.hasPassedBid) return state;

  const minRequired = state.highestBid === 0 ? state.settings.minBid : state.highestBid + state.settings.bidIncrement;
  if (amount < minRequired || amount > state.settings.maxBid) {
    return state;
  }

  const updatedPlayers = state.players.map((p) =>
    p.id === playerId ? { ...p, currentBid: amount } : p
  );

  const logs = [
    ...state.actionLogs,
    {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      text: `${player.username} bid ${amount} points.`,
      type: 'bid' as const,
    },
  ];

  // If maximum possible bid (150) reached, auction automatically ends
  if (amount >= state.settings.maxBid) {
    return finalizeAuction(
      {
        ...state,
        players: updatedPlayers,
        highestBid: amount,
        highestBidderId: playerId,
        actionLogs: logs,
        lastActiveAt: Date.now(),
      },
      playerId
    );
  }

  // Rotate to next active bidder
  const nextBidder = findNextActiveBidder(updatedPlayers, player.seatIndex);

  return {
    ...state,
    players: updatedPlayers,
    highestBid: amount,
    highestBidderId: playerId,
    currentBidderId: nextBidder?.id,
    actionLogs: logs,
    lastActiveAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function passBid(state: RoomState, playerId: string): RoomState {
  if (state.phase !== 'bidding') return state;
  if (state.currentBidderId !== playerId) return state;

  const player = state.players.find((p) => p.id === playerId);
  if (!player) return state;

  const updatedPlayers = state.players.map((p) =>
    p.id === playerId ? { ...p, hasPassedBid: true } : p
  );

  const logs = [
    ...state.actionLogs,
    {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      text: `${player.username} passed.`,
      type: 'bid' as const,
    },
  ];

  const activeBidders = updatedPlayers.filter((p) => !p.hasPassedBid);

  // If only 1 player remaining
  if (activeBidders.length === 1) {
    const winner = activeBidders[0];
    if (state.highestBid > 0) {
      // Auction completed! Winner is the highest bidder
      return finalizeAuction(
        {
          ...state,
          players: updatedPlayers,
          actionLogs: logs,
          lastActiveAt: Date.now(),
        },
        state.highestBidderId || winner.id
      );
    } else {
      // All previous passed, remaining player forced at minimum bid
      return finalizeAuction(
        {
          ...state,
          players: updatedPlayers.map((p) =>
            p.id === winner.id ? { ...p, currentBid: state.settings.minBid } : p
          ),
          highestBid: state.settings.minBid,
          highestBidderId: winner.id,
          actionLogs: [
            ...logs,
            {
              id: `log-${Date.now()}-force`,
              timestamp: Date.now(),
              text: `All players passed. ${winner.username} takes declarer at minimum bid ${state.settings.minBid}.`,
              type: 'bid',
            },
          ],
          lastActiveAt: Date.now(),
        },
        winner.id
      );
    }
  }

  if (activeBidders.length === 0) {
    // Edge case: all passed without bidding. Declarer is player 0 at minBid
    const declarer = updatedPlayers[0];
    return finalizeAuction(
      {
        ...state,
        players: updatedPlayers,
        highestBid: state.settings.minBid,
        highestBidderId: declarer.id,
        actionLogs: logs,
        lastActiveAt: Date.now(),
      },
      declarer.id
    );
  }

  // Rotate to next active bidder
  const nextBidder = findNextActiveBidder(updatedPlayers, player.seatIndex);

  return {
    ...state,
    players: updatedPlayers,
    currentBidderId: nextBidder?.id,
    actionLogs: logs,
    lastActiveAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function findNextActiveBidder(players: Player[], currentSeatIndex: number): Player | undefined {
  const numPlayers = players.length;
  for (let i = 1; i <= numPlayers; i++) {
    const nextIndex = (currentSeatIndex + i) % numPlayers;
    const candidate = players.find((p) => p.seatIndex === nextIndex);
    if (candidate && !candidate.hasPassedBid) {
      return candidate;
    }
  }
  return undefined;
}

function finalizeAuction(state: RoomState, declarerId: string): RoomState {
  const declarer = state.players.find((p) => p.id === declarerId);
  const declarerName = declarer ? declarer.username : 'Declarer';

  return {
    ...state,
    phase: 'trump_selection',
    declarerId,
    currentBidderId: undefined,
    actionLogs: [
      ...state.actionLogs,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        text: `🏆 ${declarerName} won the auction with a bid of ${state.highestBid} points! Choosing Trump & Partner Card...`,
        type: 'trump',
      },
    ],
    lastActiveAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function selectTrumpAndPartner(
  state: RoomState,
  declarerId: string,
  trumpSuit: Suit,
  calledCard: Card
): RoomState {
  if (state.phase !== 'trump_selection') return state;
  if (state.declarerId !== declarerId) return state;

  const declarer = state.players.find((p) => p.id === declarerId);
  const declarerName = declarer ? declarer.username : 'Declarer';

  // Identify partner by card held in hand (in 2-player games, it's 1v1 so declarer is solo)
  let partnerId = declarerId;
  if (state.players.length > 2) {
    for (const player of state.players) {
      if (player.hand.some((c) => c.id === calledCard.id)) {
        partnerId = player.id;
        break;
      }
    }
  }

  return {
    ...state,
    phase: 'playing',
    trumpSuit,
    calledCard,
    partnerId,
    isPartnerRevealed: false,
    currentTurnPlayerId: declarerId,
    currentTrick: {
      trickNumber: 1,
      leadPlayerId: declarerId,
      cards: [],
    },
    actionLogs: [
      ...state.actionLogs,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        text: `${declarerName} chose ${trumpSuit.toUpperCase()} as Trump (Hukum) and called ${calledCard.rank} of ${calledCard.suit}. Partner is secret!`,
        type: 'trump',
      },
    ],
    lastActiveAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function playCard(state: RoomState, playerId: string, cardId: string): RoomState {
  if (state.phase !== 'playing') return state;
  if (state.currentTurnPlayerId !== playerId) return state;

  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) return state;

  const player = state.players[playerIndex];
  const cardIndex = player.hand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) return state;

  const card = player.hand[cardIndex];

  // Legal play validation
  if (!isLegalPlay(card, player.hand, state.currentTrick.leadSuit)) {
    return state;
  }

  // Remove card from player hand
  const newHand = [...player.hand];
  newHand.splice(cardIndex, 1);

  const updatedPlayers = [...state.players];
  updatedPlayers[playerIndex] = {
    ...player,
    hand: newHand,
  };

  // Check if partner card was played
  const isPartnerCard = Boolean(state.calledCard && card.id === state.calledCard.id);
  const isPartnerRevealed: boolean = Boolean(state.isPartnerRevealed || isPartnerCard);

  const logs = [...state.actionLogs];
  logs.push({
    id: `log-${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
    text: `${player.username} played ${card.rank} of ${card.suit}.`,
    type: 'play',
  });

  if (isPartnerCard && !state.isPartnerRevealed) {
    logs.push({
      id: `log-${Date.now()}-reveal`,
      timestamp: Date.now(),
      text: `⚡ PARTNER REVEALED! ${player.username} played the called card (${card.rank} of ${card.suit}) and is the Declarer's partner!`,
      type: 'partner',
    });
  }

  const playedCardItem: PlayedCard = {
    playerId,
    playerUsername: player.username,
    card,
    seatIndex: player.seatIndex,
  };

  const updatedPlayedCards = [...state.currentTrick.cards, playedCardItem];
  const leadSuit = state.currentTrick.leadSuit || card.suit;

  const updatedTrick: Trick = {
    ...state.currentTrick,
    leadSuit,
    cards: updatedPlayedCards,
  };

  const numPlayers = state.players.length;

  // If trick is NOT complete (less than all players played)
  if (updatedPlayedCards.length < numPlayers) {
    const nextSeatIndex = (player.seatIndex + 1) % numPlayers;
    const nextPlayer = updatedPlayers.find((p) => p.seatIndex === nextSeatIndex);

    return {
      ...state,
      players: updatedPlayers,
      isPartnerRevealed,
      currentTrick: updatedTrick,
      currentTurnPlayerId: nextPlayer?.id,
      actionLogs: logs,
      lastActiveAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  // Trick IS complete (all players played)
  const { winningPlay, trickPoints } = evaluateTrick(updatedPlayedCards, state.trumpSuit);

  const trickWinnerIndex = updatedPlayers.findIndex((p) => p.id === winningPlay.playerId);
  if (trickWinnerIndex !== -1) {
    updatedPlayers[trickWinnerIndex] = {
      ...updatedPlayers[trickWinnerIndex],
      tricksWon: updatedPlayers[trickWinnerIndex].tricksWon + 1,
      cardPointsCollected: updatedPlayers[trickWinnerIndex].cardPointsCollected + trickPoints,
    };
  }

  const completedTrick: Trick = {
    ...updatedTrick,
    winnerPlayerId: winningPlay.playerId,
    winnerUsername: winningPlay.playerUsername,
    trickPoints,
  };

  logs.push({
    id: `log-${Date.now()}-win`,
    timestamp: Date.now(),
    text: `👑 ${winningPlay.playerUsername} won Trick ${state.currentTrick.trickNumber} (${trickPoints} card points collected).`,
    type: 'trick',
  });

  // Keep completed trick on board so players can view the last card played and who won.
  // currentTurnPlayerId is cleared to pause input until advanceTrickOrRound is triggered.
  return {
    ...state,
    players: updatedPlayers,
    isPartnerRevealed,
    currentTrick: completedTrick,
    currentTurnPlayerId: undefined,
    actionLogs: logs,
    lastActiveAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function advanceTrickOrRound(state: RoomState): RoomState {
  if (state.phase !== 'playing') return state;
  const completedTrick = state.currentTrick;
  if (!completedTrick.winnerPlayerId) return state;

  const numPlayers = state.players.length;
  const nextTrickNumber = completedTrick.trickNumber + 1;
  const maxTricks = state.totalTricks || Math.floor(52 / numPlayers);
  const isRoundOver = nextTrickNumber > maxTricks || state.players.every((p) => p.hand.length === 0);

  if (isRoundOver) {
    return finalizeRound({
      ...state,
      isPartnerRevealed: true,
      currentTrick: {
        trickNumber: completedTrick.trickNumber,
        leadPlayerId: '',
        cards: [],
      },
      previousTrick: completedTrick,
      completedTricks: [...state.completedTricks, completedTrick],
      lastActiveAt: Date.now(),
    });
  }

  // Continue to next trick
  return {
    ...state,
    currentTrick: {
      trickNumber: nextTrickNumber,
      leadPlayerId: completedTrick.winnerPlayerId,
      cards: [],
    },
    previousTrick: completedTrick,
    completedTricks: [...state.completedTricks, completedTrick],
    currentTurnPlayerId: completedTrick.winnerPlayerId,
    lastActiveAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function finalizeRound(state: RoomState): RoomState {
  const declarerId = state.declarerId!;
  const partnerId = state.partnerId || declarerId;

  const declarerPlayer = state.players.find((p) => p.id === declarerId);
  const partnerPlayer = state.players.find((p) => p.id === partnerId);

  // Categorize teams and calculate collected points
  let declarerTeamPoints = 0;
  let oppositionTeamPoints = 0;

  for (const p of state.players) {
    if (p.id === declarerId || p.id === partnerId) {
      declarerTeamPoints += p.cardPointsCollected;
    } else {
      oppositionTeamPoints += p.cardPointsCollected;
    }
  }

  const biddingTeamWon = declarerTeamPoints >= state.highestBid;
  const bidAmount = state.highestBid;

  // Award round points:
  // "if the bidding team wins, then they get the point equal to the amount of the bid.
  //  If the opposition wins, they get the points equal to the amount of the bid of the bidder, otherwise zero."
  const scoresAfterRound: Record<string, number> = {};

  const updatedPlayers = state.players.map((p) => {
    const isDeclarerTeam = p.id === declarerId || p.id === partnerId;
    let addedMatchPoints = 0;

    if (biddingTeamWon) {
      if (isDeclarerTeam) {
        addedMatchPoints = bidAmount;
      }
    } else {
      if (!isDeclarerTeam) {
        addedMatchPoints = bidAmount;
      }
    }

    const newMatchScore = p.matchScore + addedMatchPoints;
    scoresAfterRound[p.id] = newMatchScore;

    return {
      ...p,
      matchScore: newMatchScore,
      team: isDeclarerTeam ? ('declarer' as const) : ('opposition' as const),
    };
  });

  const roundResult: RoundResult = {
    roundNumber: state.currentRound,
    declarerId,
    declarerUsername: declarerPlayer?.username || 'Declarer',
    partnerId,
    partnerUsername: partnerPlayer?.username || 'Partner',
    calledCard: state.calledCard!,
    trumpSuit: state.trumpSuit!,
    bidAmount,
    declarerTeamPoints,
    oppositionTeamPoints,
    biddingTeamWon,
    pointsAwarded: bidAmount,
    scoresAfterRound,
  };

  const logs = [...state.actionLogs];
  if (biddingTeamWon) {
    logs.push({
      id: `log-${Date.now()}-res`,
      timestamp: Date.now(),
      text: `🎉 BID SUCCESS! Declarer team made ${declarerTeamPoints}/${bidAmount} points! Declarer and Partner each receive +${bidAmount} match points!`,
      type: 'round',
    });
  } else {
    logs.push({
      id: `log-${Date.now()}-res`,
      timestamp: Date.now(),
      text: `🛡️ DEFENSE WON! Declarer team scored only ${declarerTeamPoints}/${bidAmount} points! Opposition members each receive +${bidAmount} match points!`,
      type: 'round',
    });
  }

  const isMatchOver = state.currentRound >= state.totalRounds;

  return {
    ...state,
    phase: isMatchOver ? 'match_end' : 'round_end',
    players: updatedPlayers,
    isPartnerRevealed: true,
    roundResults: [...state.roundResults, roundResult],
    actionLogs: logs,
    lastActiveAt: Date.now(),
    updatedAt: Date.now(),
  };
}
