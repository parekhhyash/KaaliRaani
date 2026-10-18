'use client';

import { RoomState, P2PMessage, GameSettings, Suit, Card } from '@/types/game';
import { ROOM_INACTIVITY_TIMEOUT_MS, MAX_PLAYERS } from '../constants';
import {
  createInitialRoomState,
  addPlayerToRoom,
  reconnectPlayer,
  addBotPlayer,
  removeBotPlayer,
  startRound,
  placeBid,
  passBid,
  selectTrumpAndPartner,
  playCard,
} from '../gameEngine';
import { botChooseCardToPlay, botChooseTrumpAndPartner, evaluateBotBid } from '../botAi';

export type PeerStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface PeerConnectionMap {
  [peerId: string]: any; // DataConnection
}

export class PeerGameManager {
  private peer: any = null;
  private connections: PeerConnectionMap = {};
  private hostConnection: any = null;
  
  public myPeerId: string = '';
  public username: string = '';
  public roomCode: string = '';
  public isHost: boolean = false;
  
  public currentState: RoomState | null = null;
  private onStateChangeCallbacks: ((state: RoomState) => void)[] = [];
  private onStatusChangeCallbacks: ((status: PeerStatus, message?: string) => void)[] = [];
  private onChatMessageCallbacks: ((msg: { username: string; text: string; timestamp: number }) => void)[] = [];
  
  private botTimer: NodeJS.Timeout | null = null;
  private inactivityInterval: NodeJS.Timeout | null = null;
  private isDestroyed: boolean = false;

  constructor() {
    this.startInactivityChecker();
  }

  private startInactivityChecker() {
    if (typeof window === 'undefined') return;
    this.inactivityInterval = setInterval(() => {
      if (this.isDestroyed) return;
      if (this.currentState && this.currentState.lastActiveAt) {
        if (Date.now() - this.currentState.lastActiveAt > ROOM_INACTIVITY_TIMEOUT_MS) {
          this.handleInactivityExpiration();
        }
      }
    }, 30000);
  }

  private handleInactivityExpiration() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`kr_state_${this.roomCode}`);
        localStorage.removeItem('kaali_raani_session');
      } catch {}
    }
    this.notifyStatus('disconnected', 'Room closed after 15 minutes of inactivity.');
    this.destroy();
  }

  public subscribeState(cb: (state: RoomState) => void) {
    this.onStateChangeCallbacks.push(cb);
    if (this.currentState) cb(this.currentState);
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter((c) => c !== cb);
    };
  }

  public subscribeStatus(cb: (status: PeerStatus, message?: string) => void) {
    this.onStatusChangeCallbacks.push(cb);
    return () => {
      this.onStatusChangeCallbacks = this.onStatusChangeCallbacks.filter((c) => c !== cb);
    };
  }

  public subscribeChat(cb: (msg: { username: string; text: string; timestamp: number }) => void) {
    this.onChatMessageCallbacks.push(cb);
    return () => {
      this.onChatMessageCallbacks = this.onChatMessageCallbacks.filter((c) => c !== cb);
    };
  }

  private notifyStatus(status: PeerStatus, message?: string) {
    this.onStatusChangeCallbacks.forEach((cb) => cb(status, message));
  }

  private updateState(newState: RoomState) {
    this.currentState = newState;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`kr_state_${this.roomCode}`, JSON.stringify(newState));
      } catch {
        // quota ignore
      }
    }
    this.onStateChangeCallbacks.forEach((cb) => cb(newState));

    // If host, check if next turn belongs to a bot
    if (this.isHost) {
      this.checkAndExecuteBotTurn(newState);
    }
  }

  /**
   * Initializes host room
   */
  public async initHost(roomCode: string, username: string, settings?: Partial<GameSettings>): Promise<void> {
    this.roomCode = roomCode.toUpperCase().trim();
    this.username = username.trim();
    this.isHost = true;
    this.notifyStatus('connecting', 'Creating room host connection...');

    const Peer = (await import('peerjs')).default;
    const hostPeerId = `kr-${this.roomCode}-host`;
    this.myPeerId = hostPeerId;

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer(hostPeerId, {
          debug: 1,
        });

        this.peer.on('open', (id: string) => {
          this.notifyStatus('connected', 'Room created successfully');
          
          // Check if restored state exists in localStorage
          let initialState: RoomState;
          const cached = typeof window !== 'undefined' ? localStorage.getItem(`kr_state_${this.roomCode}`) : null;
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              // Clean up if inactive for > 15 minutes
              if (parsed.lastActiveAt && Date.now() - parsed.lastActiveAt > ROOM_INACTIVITY_TIMEOUT_MS) {
                localStorage.removeItem(`kr_state_${this.roomCode}`);
                initialState = createInitialRoomState(this.roomCode, { id, username: this.username }, settings);
              } else {
                initialState = reconnectPlayer(parsed, this.username, id);
              }
            } catch {
              initialState = createInitialRoomState(this.roomCode, { id, username: this.username }, settings);
            }
          } else {
            initialState = createInitialRoomState(this.roomCode, { id, username: this.username }, settings);
          }

          this.updateState(initialState);
          resolve();
        });

        this.peer.on('connection', (conn: any) => {
          this.handleIncomingClient(conn);
        });

        this.peer.on('error', (err: any) => {
          console.warn('Peer host error:', err);
          if (err.type === 'unavailable-id') {
            // If already exists, maybe host refreshed. Try rejoining or reconnecting
            this.notifyStatus('connected', 'Reconnected as Host');
            resolve();
          } else {
            this.notifyStatus('error', err.message || 'Host connection error');
          }
        });
      } catch (err: any) {
        this.notifyStatus('error', err.message || 'Failed to initialize PeerJS');
        reject(err);
      }
    });
  }

  /**
   * Initializes client joining a room
   */
  public async initClient(roomCode: string, username: string): Promise<void> {
    this.roomCode = roomCode.toUpperCase().trim();
    this.username = username.trim();
    this.isHost = false;
    this.notifyStatus('connecting', `Connecting to room ${this.roomCode}...`);

    const Peer = (await import('peerjs')).default;
    const cleanName = username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 8);
    const clientPeerId = `kr-${this.roomCode}-${cleanName}-${Math.random().toString(36).substring(2, 6)}`;
    this.myPeerId = clientPeerId;

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer(clientPeerId, {
          debug: 1,
        });

        this.peer.on('open', () => {
          const hostPeerId = `kr-${this.roomCode}-host`;
          this.connectToHost(hostPeerId, resolve, reject);
        });

        this.peer.on('error', (err: any) => {
          console.warn('Client peer error:', err);
          this.notifyStatus('error', err.message || 'Client connection error');
        });
      } catch (err: any) {
        this.notifyStatus('error', err.message || 'Failed to initialize Peer');
        reject(err);
      }
    });
  }

  private connectToHost(hostPeerId: string, resolve: () => void, reject: (err: any) => void) {
    const conn = this.peer.connect(hostPeerId, {
      reliable: true,
    });

    this.hostConnection = conn;

    conn.on('open', () => {
      this.notifyStatus('connected', 'Connected to room host');
      // Send join or reconnect request
      const msg: P2PMessage = {
        type: 'JOIN_REQUEST',
        username: this.username,
        playerId: this.myPeerId,
        isHost: false,
      };
      conn.send(msg);
      resolve();
    });

    conn.on('data', (data: any) => {
      this.handleClientReceivedData(data);
    });

    conn.on('close', () => {
      this.notifyStatus('disconnected', 'Host disconnected. Attempting to reconnect...');
      this.attemptClientReconnect(hostPeerId);
    });

    conn.on('error', (err: any) => {
      console.warn('Host connection error:', err);
      this.notifyStatus('error', 'Could not connect to host');
      reject(err);
    });
  }

  private attemptClientReconnect(hostPeerId: string) {
    if (this.isDestroyed) return;
    setTimeout(() => {
      if (this.peer && !this.peer.destroyed) {
        this.connectToHost(hostPeerId, () => {}, () => {});
      }
    }, 2500);
  }

  private handleIncomingClient(conn: any) {
    conn.on('open', () => {
      this.connections[conn.peer] = conn;
    });

    conn.on('data', (data: any) => {
      this.handleHostReceivedData(conn, data);
    });

    conn.on('close', () => {
      delete this.connections[conn.peer];
      // Mark player as disconnected in state without removing them
      if (this.currentState) {
        const updatedPlayers = this.currentState.players.map((p) =>
          p.id === conn.peer ? { ...p, isConnected: false } : p
        );
        this.broadcastState({ ...this.currentState, players: updatedPlayers });
      }
    });
  }

  /**
   * Host processes actions and broadcasts state
   */
  private handleHostReceivedData(conn: any, data: any) {
    if (!this.isHost || !this.currentState) return;

    const message = data as P2PMessage;

    switch (message.type) {
      case 'JOIN_REQUEST':
      case 'PLAYER_RECONNECT': {
        try {
          const updated = addPlayerToRoom(this.currentState, {
            id: message.playerId,
            username: message.username,
          });
          this.broadcastState(updated);
        } catch {
          // If room full, send state anyway so user can see spectator / error
          conn.send({ type: 'SYNC_STATE', state: this.currentState });
        }
        break;
      }

      case 'PLACE_BID': {
        const updated = placeBid(this.currentState, message.playerId, message.amount);
        this.broadcastState(updated);
        break;
      }

      case 'PASS_BID': {
        const updated = passBid(this.currentState, message.playerId);
        this.broadcastState(updated);
        break;
      }

      case 'SELECT_TRUMP_AND_PARTNER': {
        const updated = selectTrumpAndPartner(
          this.currentState,
          message.playerId,
          message.trumpSuit,
          message.calledCard
        );
        this.broadcastState(updated);
        break;
      }

      case 'PLAY_CARD': {
        const updated = playCard(this.currentState, message.playerId, message.cardId);
        this.broadcastState(updated);
        break;
      }

      case 'CHAT_MESSAGE': {
        this.broadcastMessage(message);
        this.onChatMessageCallbacks.forEach((cb) => cb(message));
        break;
      }

      default:
        break;
    }
  }

  /**
   * Client receives updates from Host
   */
  private handleClientReceivedData(data: any) {
    if (data.type === 'SYNC_STATE') {
      this.updateState(data.state);
    } else if (data.type === 'CHAT_MESSAGE') {
      this.onChatMessageCallbacks.forEach((cb) => cb(data));
    }
  }

  /**
   * Host broadcasts updated state to all connected peers
   */
  private broadcastState(newState: RoomState) {
    this.updateState(newState);
    const msg = { type: 'SYNC_STATE', state: newState };
    for (const peerId in this.connections) {
      try {
        this.connections[peerId].send(msg);
      } catch (e) {
        console.warn('Error sending state to peer', peerId, e);
      }
    }
  }

  private broadcastMessage(msg: P2PMessage) {
    for (const peerId in this.connections) {
      try {
        this.connections[peerId].send(msg);
      } catch {}
    }
  }

  /**
   * Automated turn execution for AI bots (runs on Host machine)
   */
  private checkAndExecuteBotTurn(state: RoomState) {
    if (!this.isHost) return;
    if (this.botTimer) clearTimeout(this.botTimer);

    // 1. Check if bidding turn belongs to a Bot
    if (state.phase === 'bidding' && state.currentBidderId) {
      const activePlayer = state.players.find((p) => p.id === state.currentBidderId);
      if (activePlayer && activePlayer.isBot) {
        this.botTimer = setTimeout(() => {
          if (!this.currentState || this.currentState.phase !== 'bidding') return;
          const bidAmount = evaluateBotBid(
            activePlayer.hand,
            this.currentState.highestBid,
            this.currentState.settings.minBid
          );
          if (bidAmount !== null) {
            const updated = placeBid(this.currentState, activePlayer.id, bidAmount);
            this.broadcastState(updated);
          } else {
            const updated = passBid(this.currentState, activePlayer.id);
            this.broadcastState(updated);
          }
        }, 1200);
        return;
      }
    }

    // 2. Check if Trump & Partner selection belongs to a Bot
    if (state.phase === 'trump_selection' && state.declarerId) {
      const declarer = state.players.find((p) => p.id === state.declarerId);
      if (declarer && declarer.isBot) {
        this.botTimer = setTimeout(() => {
          if (!this.currentState || this.currentState.phase !== 'trump_selection') return;
          const { trumpSuit, calledCard } = botChooseTrumpAndPartner(declarer.hand);
          const updated = selectTrumpAndPartner(
            this.currentState,
            declarer.id,
            trumpSuit,
            calledCard
          );
          this.broadcastState(updated);
        }, 1500);
        return;
      }
    }

    // 3. Check if Card Play turn belongs to a Bot
    if (state.phase === 'playing' && state.currentTurnPlayerId) {
      const activePlayer = state.players.find((p) => p.id === state.currentTurnPlayerId);
      if (activePlayer && activePlayer.isBot) {
        this.botTimer = setTimeout(() => {
          if (!this.currentState || this.currentState.phase !== 'playing') return;
          const cardToPlay = botChooseCardToPlay(activePlayer, this.currentState);
          if (cardToPlay) {
            const updated = playCard(this.currentState, activePlayer.id, cardToPlay.id);
            this.broadcastState(updated);
          }
        }, 1400);
        return;
      }
    }
  }

  // --- Public Action Methods triggered by UI ---

  public startGame() {
    if (!this.isHost || !this.currentState) return;
    let state = this.currentState;

    // Must have at least 2 players to start
    if (state.players.length < 2) {
      state = addBotPlayer(state);
    }

    const roundStarted = startRound(state, 1);
    this.broadcastState(roundStarted);
  }

  public nextRound() {
    if (!this.isHost || !this.currentState) return;
    const nextRoundNum = this.currentState.currentRound + 1;
    if (nextRoundNum <= this.currentState.totalRounds) {
      const roundStarted = startRound(this.currentState, nextRoundNum);
      this.broadcastState(roundStarted);
    }
  }

  public restartGame() {
    if (!this.isHost || !this.currentState) return;
    const resetPlayers = this.currentState.players.map((p) => ({
      ...p,
      matchScore: 0,
      tricksWon: 0,
      cardPointsCollected: 0,
      hand: [],
    }));
    const restarted = startRound({ ...this.currentState, players: resetPlayers, roundResults: [] }, 1);
    this.broadcastState(restarted);
  }

  public addBot() {
    if (!this.isHost || !this.currentState) return;
    const maxAllowed = this.currentState.settings.maxPlayers || MAX_PLAYERS;
    if (this.currentState.players.length >= maxAllowed) return;
    const updated = addBotPlayer(this.currentState);
    this.broadcastState(updated);
  }

  public removeBot(botId: string) {
    if (!this.isHost || !this.currentState) return;
    const updated = removeBotPlayer(this.currentState, botId);
    this.broadcastState(updated);
  }

  public updateSettings(settings: Partial<GameSettings>) {
    if (!this.isHost || !this.currentState) return;
    const updated: RoomState = {
      ...this.currentState,
      settings: { ...this.currentState.settings, ...settings },
      totalRounds: settings.totalRounds ?? this.currentState.totalRounds,
    };
    this.broadcastState(updated);
  }

  public placeBid(amount: number) {
    if (this.isHost) {
      if (!this.currentState) return;
      const updated = placeBid(this.currentState, this.myPeerId, amount);
      this.broadcastState(updated);
    } else if (this.hostConnection) {
      this.hostConnection.send({
        type: 'PLACE_BID',
        playerId: this.myPeerId,
        amount,
      });
    }
  }

  public passBid() {
    if (this.isHost) {
      if (!this.currentState) return;
      const updated = passBid(this.currentState, this.myPeerId);
      this.broadcastState(updated);
    } else if (this.hostConnection) {
      this.hostConnection.send({
        type: 'PASS_BID',
        playerId: this.myPeerId,
      });
    }
  }

  public selectTrumpAndPartner(trumpSuit: Suit, calledCard: Card) {
    if (this.isHost) {
      if (!this.currentState) return;
      const updated = selectTrumpAndPartner(
        this.currentState,
        this.myPeerId,
        trumpSuit,
        calledCard
      );
      this.broadcastState(updated);
    } else if (this.hostConnection) {
      this.hostConnection.send({
        type: 'SELECT_TRUMP_AND_PARTNER',
        playerId: this.myPeerId,
        trumpSuit,
        calledCard,
      });
    }
  }

  public playCard(cardId: string) {
    if (this.isHost) {
      if (!this.currentState) return;
      const updated = playCard(this.currentState, this.myPeerId, cardId);
      this.broadcastState(updated);
    } else if (this.hostConnection) {
      this.hostConnection.send({
        type: 'PLAY_CARD',
        playerId: this.myPeerId,
        cardId,
      });
    }
  }

  public sendChatMessage(text: string) {
    const chatMsg = {
      type: 'CHAT_MESSAGE' as const,
      username: this.username,
      text: text.trim(),
      timestamp: Date.now(),
    };
    if (this.isHost) {
      this.broadcastMessage(chatMsg);
      this.onChatMessageCallbacks.forEach((cb) => cb(chatMsg));
    } else if (this.hostConnection) {
      this.hostConnection.send(chatMsg);
    }
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.botTimer) clearTimeout(this.botTimer);
    if (this.inactivityInterval) clearInterval(this.inactivityInterval);
    try {
      if (this.peer) this.peer.destroy();
    } catch {}
  }
}
