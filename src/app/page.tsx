'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { RoomState, Suit, Card, GameSettings } from '@/types/game';
import { PeerGameManager, PeerStatus } from '@/lib/p2p/peerManager';
import { Navbar } from '@/components/Navbar';
import { RulesModal } from '@/components/RulesModal';
import { LeaderboardModal } from '@/components/LeaderboardModal';
import { JoinOrCreateModal } from '@/components/JoinOrCreateModal';
import { GameLobby } from '@/components/GameLobby';
import { BiddingModal } from '@/components/BiddingModal';
import { TrumpSelectionModal } from '@/components/TrumpSelectionModal';
import { GameBoard } from '@/components/GameBoard';
import { RoundEndModal } from '@/components/RoundEndModal';
import { FinalLeaderboardModal } from '@/components/FinalLeaderboardModal';

interface SavedSession {
  roomCode: string;
  username: string;
  isHost: boolean;
}

function KaaliRaaniGame() {
  const searchParams = useSearchParams();
  const initialRoomFromUrl = searchParams.get('room') || '';

  const [manager, setManager] = useState<PeerGameManager | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [peerStatus, setPeerStatus] = useState<PeerStatus>('disconnected');
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isCardsHidden, setIsCardsHidden] = useState(false);

  const handleToggleHideCards = () => {
    setIsCardsHidden((prev) => !prev);
  };

  // Session persistence
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);

  const managerRef = useRef<PeerGameManager | null>(null);

  useEffect(() => {
    // Check local storage for previous session
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('kaali_raani_session');
        if (stored) {
          const parsed: SavedSession = JSON.parse(stored);
          setSavedSession(parsed);
        }
      } catch {}
    }

    return () => {
      if (managerRef.current) {
        managerRef.current.destroy();
      }
    };
  }, []);

  const initManager = () => {
    if (managerRef.current) {
      managerRef.current.destroy();
    }
    const mgr = new PeerGameManager();
    managerRef.current = mgr;
    setManager(mgr);

    mgr.subscribeState((newState) => {
      setRoomState(newState);
    });

    mgr.subscribeStatus((status, message) => {
      setPeerStatus(status);
      if (message) setStatusMessage(message);
    });

    return mgr;
  };

  const handleCreateRoom = async (username: string, totalRounds: number) => {
    // Generate clean 6-character room code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'KQ';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const session: SavedSession = { roomCode: code, username, isHost: true };
    localStorage.setItem('kaali_raani_session', JSON.stringify(session));
    setSavedSession(session);

    const mgr = initManager();
    await mgr.initHost(code, username, { totalRounds });
  };

  const handleJoinRoom = async (roomCode: string, username: string) => {
    const cleanCode = roomCode.toUpperCase().trim();
    const session: SavedSession = { roomCode: cleanCode, username, isHost: false };
    localStorage.setItem('kaali_raani_session', JSON.stringify(session));
    setSavedSession(session);

    const mgr = initManager();
    await mgr.initClient(cleanCode, username);
  };

  const handleResumeSession = async () => {
    if (!savedSession) return;
    const mgr = initManager();
    if (savedSession.isHost) {
      await mgr.initHost(savedSession.roomCode, savedSession.username);
    } else {
      await mgr.initClient(savedSession.roomCode, savedSession.username);
    }
  };

  const handleStartGame = () => {
    manager?.startGame();
  };

  const handleNextRound = () => {
    manager?.nextRound();
  };

  const handleRestartGame = () => {
    manager?.restartGame();
  };

  const handleAddBot = () => {
    manager?.addBot();
  };

  const handleRemoveBot = (botId: string) => {
    manager?.removeBot(botId);
  };

  const handleUpdateSettings = (settings: Partial<GameSettings>) => {
    manager?.updateSettings(settings);
  };

  const handlePlaceBid = (amount: number) => {
    manager?.placeBid(amount);
  };

  const handlePassBid = () => {
    manager?.passBid();
  };

  const handleSelectTrumpAndPartner = (trumpSuit: Suit, calledCard: Card) => {
    manager?.selectTrumpAndPartner(trumpSuit, calledCard);
  };

  const handlePlayCard = (cardId: string) => {
    manager?.playCard(cardId);
  };

  const handleSendChat = (text: string) => {
    manager?.sendChatMessage(text);
  };

  // Find my player in state
  const myPlayerId = manager?.myPeerId || '';
  const myUsername = manager?.username || '';
  const myPlayer =
    roomState?.players.find((p) => p.id === myPlayerId) ||
    roomState?.players.find((p) => p.username.toLowerCase() === myUsername.toLowerCase()) ||
    roomState?.players[0];

  const isHost = manager?.isHost || myPlayer?.isHost || false;
  const isDeclarer = roomState?.declarerId === myPlayer?.id;
  const declarerPlayer = roomState?.players.find((p) => p.id === roomState?.declarerId);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Top Navigation */}
      <Navbar
        roomCode={roomState?.roomCode || savedSession?.roomCode || ''}
        currentRound={roomState?.currentRound || 0}
        totalRounds={roomState?.totalRounds || 3}
        peerStatus={peerStatus}
        isCardsHidden={isCardsHidden}
        onToggleHideCards={handleToggleHideCards}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
      />

      {/* Main Game Screen */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 w-full">
        {/* Connection message notification if error */}
        {peerStatus === 'error' && (
          <div className="w-full max-w-lg mb-4 p-3 bg-rose-950/80 border border-rose-700 rounded-xl text-rose-300 text-xs text-center font-mono">
            {statusMessage || 'Network connection issue. Please check room code and try again.'}
          </div>
        )}

        {/* 1. LANDING: CREATE OR JOIN ROOM */}
        {!roomState ? (
          <JoinOrCreateModal
            initialRoomCode={initialRoomFromUrl}
            hasPreviousSession={!!savedSession}
            previousRoomCode={savedSession?.roomCode}
            previousUsername={savedSession?.username}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onResumeSession={handleResumeSession}
            onOpenRules={() => setIsRulesOpen(true)}
          />
        ) : (
          <>
            {/* 2. LOBBY */}
            {roomState.phase === 'lobby' && (
              <GameLobby
                roomCode={roomState.roomCode}
                players={roomState.players}
                isHost={isHost}
                settings={roomState.settings}
                onStartGame={handleStartGame}
                onAddBot={handleAddBot}
                onRemoveBot={handleRemoveBot}
                onUpdateSettings={handleUpdateSettings}
              />
            )}

            {/* 3. BIDDING */}
            {roomState.phase === 'bidding' && (
              <BiddingModal
                currentBidderId={roomState.currentBidderId}
                highestBid={roomState.highestBid}
                highestBidderId={roomState.highestBidderId}
                myPlayerId={myPlayer?.id || ''}
                players={roomState.players}
                minBid={roomState.settings.minBid}
                bidIncrement={roomState.settings.bidIncrement}
                maxBid={roomState.settings.maxBid}
                myHand={myPlayer?.hand || []}
                isCardsHidden={isCardsHidden}
                onToggleHideCards={handleToggleHideCards}
                onPlaceBid={handlePlaceBid}
                onPassBid={handlePassBid}
              />
            )}

            {/* 4. TRUMP & PARTNER SELECTION */}
            {roomState.phase === 'trump_selection' && (
              <TrumpSelectionModal
                isDeclarer={isDeclarer}
                declarerUsername={declarerPlayer?.username || 'Declarer'}
                highestBid={roomState.highestBid}
                myHand={myPlayer?.hand || []}
                isCardsHidden={isCardsHidden}
                onToggleHideCards={handleToggleHideCards}
                onConfirm={handleSelectTrumpAndPartner}
              />
            )}

            {/* 5. PLAYING TRICKS */}
            {roomState.phase === 'playing' && (
              <GameBoard
                state={roomState}
                myPlayerId={myPlayer?.id || ''}
                isCardsHidden={isCardsHidden}
                onToggleHideCards={handleToggleHideCards}
                onPlayCard={handlePlayCard}
                onSendChat={handleSendChat}
              />
            )}

            {/* 6. ROUND END SUMMARY */}
            {roomState.phase === 'round_end' && (
              <>
                <GameBoard
                  state={roomState}
                  myPlayerId={myPlayer?.id || ''}
                  isCardsHidden={isCardsHidden}
                  onToggleHideCards={handleToggleHideCards}
                  onPlayCard={handlePlayCard}
                  onSendChat={handleSendChat}
                />
                {roomState.roundResults.length > 0 && (
                  <RoundEndModal
                    roundResult={roomState.roundResults[roomState.roundResults.length - 1]}
                    players={roomState.players}
                    currentRound={roomState.currentRound}
                    totalRounds={roomState.totalRounds}
                    isHost={isHost}
                    onNextRound={handleNextRound}
                  />
                )}
              </>
            )}

            {/* 7. MATCH END & FINAL LEADERBOARD */}
            {roomState.phase === 'match_end' && (
              <>
                <GameBoard
                  state={roomState}
                  myPlayerId={myPlayer?.id || ''}
                  isCardsHidden={isCardsHidden}
                  onToggleHideCards={handleToggleHideCards}
                  onPlayCard={handlePlayCard}
                  onSendChat={handleSendChat}
                />
                <FinalLeaderboardModal
                  players={roomState.players}
                  roundResults={roomState.roundResults}
                  totalRounds={roomState.totalRounds}
                  isHost={isHost}
                  onRestartGame={handleRestartGame}
                />
              </>
            )}
          </>
        )}
      </main>

      {/* Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        players={roomState?.players || []}
        roundResults={roomState?.roundResults || []}
        currentRound={roomState?.currentRound || 1}
        totalRounds={roomState?.totalRounds || 3}
      />

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900 py-3.5 px-4 text-center text-xs text-zinc-500 font-mono flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3">
        <span>Kaali Raani (Black Queen) • 150 Points Deck</span>
        <span className="hidden sm:inline">•</span>
        <span>
          Made with ❤️ by{' '}
          <a
            href="https://github.com/parekhhyash"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:underline font-bold transition-colors"
          >
            Yash Parekh
          </a>
        </span>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
          Loading Kaali Raani...
        </div>
      }
    >
      <KaaliRaaniGame />
    </Suspense>
  );
}
