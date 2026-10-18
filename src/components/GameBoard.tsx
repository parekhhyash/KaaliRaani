'use client';

import React, { useState, useEffect } from 'react';
import { RoomState, Card, Player, PlayedCard } from '@/types/game';
import { CardView } from './CardView';
import { SUIT_SYMBOLS } from '@/lib/constants';
import { isLegalPlay } from '@/lib/deck';
import { sounds } from '@/lib/audio';
import { Crown, UserCheck, Bot, Sparkles, MessageSquare } from 'lucide-react';

interface GameBoardProps {
  state: RoomState;
  myPlayerId: string;
  onPlayCard: (cardId: string) => void;
  onSendChat?: (text: string) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  state,
  myPlayerId,
  onPlayCard,
}) => {
  const {
    players,
    trumpSuit,
    calledCard,
    isPartnerRevealed,
    currentTrick,
    previousTrick,
    currentTurnPlayerId,
    declarerId,
    partnerId,
    highestBid,
    actionLogs,
  } = state;

  const [showLogs, setShowLogs] = useState(false);

  const me = players.find((p) => p.id === myPlayerId) || players[0];
  const mySeat = me.seatIndex;
  const isMyTurn = currentTurnPlayerId === myPlayerId;

  // Sound trigger on partner reveal
  useEffect(() => {
    if (isPartnerRevealed) {
      sounds.playPartnerReveal();
    }
  }, [isPartnerRevealed]);

  // Arrange players relative to current user:
  // Bottom: Me (index 0 offset)
  // Left: (mySeat + 1) % 4
  // Top: (mySeat + 2) % 4
  // Right: (mySeat + 3) % 4
  const getPlayerAtOffset = (offset: number): Player | undefined => {
    const seat = (mySeat + offset) % 4;
    return players.find((p) => p.seatIndex === seat);
  };

  const leftPlayer = getPlayerAtOffset(1);
  const topPlayer = getPlayerAtOffset(2);
  const rightPlayer = getPlayerAtOffset(3);

  const handleCardClick = (card: Card) => {
    if (!isMyTurn) return;
    if (isLegalPlay(card, me.hand, currentTrick.leadSuit)) {
      sounds.playCardPlay();
      onPlayCard(card.id);
    }
  };

  const renderPlayerBadge = (player?: Player) => {
    if (!player) return null;
    const isTurn = player.id === currentTurnPlayerId;
    const isDeclarer = player.id === declarerId;
    const isPartner = isPartnerRevealed && player.id === partnerId;
    const isOpponent = isPartnerRevealed && !isDeclarer && !isPartner;

    return (
      <div
        className={`flex items-center space-x-2.5 p-2 sm:p-2.5 rounded-xl border transition-all ${
          isTurn
            ? 'bg-zinc-900 border-white shadow-lg ring-1 ring-white/50 scale-105'
            : 'bg-zinc-950/90 border-zinc-800'
        }`}
      >
        <div className="w-8 h-8 rounded-lg bg-black border border-zinc-700 flex items-center justify-center font-bold text-xs text-white">
          {player.isBot ? <Bot className="w-4 h-4 text-zinc-400" /> : player.seatIndex + 1}
        </div>

        <div className="flex flex-col text-left">
          <div className="flex items-center space-x-1.5 leading-none">
            <span className="font-bold text-white text-xs sm:text-sm truncate max-w-[90px] sm:max-w-[120px]">
              {player.username}
            </span>
            {isDeclarer && (
              <span className="text-[10px] bg-white text-black font-extrabold px-1 rounded flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5 fill-current" /> Declarer
              </span>
            )}
            {isPartner && (
              <span className="text-[10px] bg-zinc-300 text-black font-extrabold px-1 rounded flex items-center gap-0.5">
                <UserCheck className="w-2.5 h-2.5" /> Partner
              </span>
            )}
            {isOpponent && (
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1 rounded border border-zinc-700">
                Defense
              </span>
            )}
          </div>

          <div className="text-[11px] text-zinc-400 font-mono mt-1 flex items-center gap-2">
            <span>{player.hand.length} cards</span>
            <span>•</span>
            <span className="text-zinc-300 font-semibold">{player.cardPointsCollected} pts</span>
          </div>
        </div>
      </div>
    );
  };

  // Find played card for a player in current trick
  const getPlayedCardForPlayer = (playerId?: string): PlayedCard | undefined => {
    if (!playerId) return undefined;
    return currentTrick.cards.find((c) => c.playerId === playerId);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-between min-h-[calc(100vh-100px)] text-white px-2 sm:px-4 py-2 select-none">
      {/* Top HUD: Trump, Partner Card, Target Bid */}
      <div className="w-full bg-zinc-950/90 border border-zinc-800 rounded-2xl px-4 py-2.5 mb-3 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-mono shadow-xl">
        <div className="flex items-center space-x-4">
          {/* Trump Suit */}
          <div className="flex items-center space-x-1.5">
            <span className="text-zinc-500 uppercase text-[11px]">Hukum:</span>
            <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded text-white font-bold">
              <span className="text-base sm:text-lg">{trumpSuit ? SUIT_SYMBOLS[trumpSuit] : '-'}</span>
              <span className="capitalize">{trumpSuit}</span>
            </div>
          </div>

          {/* Called Partner Card */}
          <div className="flex items-center space-x-1.5">
            <span className="text-zinc-500 uppercase text-[11px]">Partner Card:</span>
            {calledCard && (
              <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded text-white font-bold">
                <span>{calledCard.rank}</span>
                <span>{SUIT_SYMBOLS[calledCard.suit]}</span>
                <span className="text-[10px] ml-1 px-1 rounded bg-zinc-800 text-zinc-300">
                  {isPartnerRevealed ? 'Revealed' : 'Secret'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Target */}
          <div>
            <span className="text-zinc-500 uppercase text-[11px]">Target Bid: </span>
            <span className="text-white font-bold">{highestBid} pts</span>
          </div>

          {/* Trick Number */}
          <div className="bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded text-zinc-300">
            Trick <strong className="text-white">{currentTrick.trickNumber}</strong> / 13
          </div>

          {/* Toggle Log button */}
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
            title="Toggle action log"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Partner Revealed Banner */}
      {isPartnerRevealed && (
        <div className="w-full bg-white text-black py-1.5 px-4 rounded-xl mb-3 flex items-center justify-center space-x-2 text-xs font-black uppercase tracking-wider animate-in fade-in shadow-xl">
          <Sparkles className="w-4 h-4 fill-current" />
          <span>
            Partner Revealed: {players.find((p) => p.id === partnerId)?.username} holds the {calledCard?.rank} of{' '}
            {calledCard?.suit}!
          </span>
        </div>
      )}

      {/* Main Playing Table Area */}
      <div className="relative w-full max-w-4xl h-[380px] sm:h-[420px] bg-zinc-950 border border-zinc-800/80 rounded-3xl shadow-2xl flex items-center justify-center p-4 overflow-hidden">
        {/* Subtle table felt lines */}
        <div className="absolute inset-4 border border-zinc-900 rounded-2xl pointer-events-none" />
        <div className="absolute w-44 h-44 rounded-full border border-zinc-900 pointer-events-none" />

        {/* TOP PLAYER */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
          {renderPlayerBadge(topPlayer)}
        </div>

        {/* LEFT PLAYER */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center z-10">
          {renderPlayerBadge(leftPlayer)}
        </div>

        {/* RIGHT PLAYER */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center z-10">
          {renderPlayerBadge(rightPlayer)}
        </div>

        {/* CENTER FELT: PLAYED CARDS */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
          {/* Top Played Card */}
          {topPlayer && getPlayedCardForPlayer(topPlayer.id) && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center animate-in zoom-in-95 duration-150">
              <CardView card={getPlayedCardForPlayer(topPlayer.id)?.card} size="sm" isPlayable={false} />
              <span className="text-[10px] text-zinc-400 font-mono mt-0.5">{topPlayer.username}</span>
            </div>
          )}

          {/* Left Played Card */}
          {leftPlayer && getPlayedCardForPlayer(leftPlayer.id) && (
            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center animate-in zoom-in-95 duration-150">
              <CardView card={getPlayedCardForPlayer(leftPlayer.id)?.card} size="sm" isPlayable={false} />
              <span className="text-[10px] text-zinc-400 font-mono mt-0.5">{leftPlayer.username}</span>
            </div>
          )}

          {/* Right Played Card */}
          {rightPlayer && getPlayedCardForPlayer(rightPlayer.id) && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center animate-in zoom-in-95 duration-150">
              <CardView card={getPlayedCardForPlayer(rightPlayer.id)?.card} size="sm" isPlayable={false} />
              <span className="text-[10px] text-zinc-400 font-mono mt-0.5">{rightPlayer.username}</span>
            </div>
          )}

          {/* Bottom (My) Played Card */}
          {getPlayedCardForPlayer(me.id) && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center animate-in zoom-in-95 duration-150">
              <CardView card={getPlayedCardForPlayer(me.id)?.card} size="sm" isPlayable={false} />
              <span className="text-[10px] text-white font-bold font-mono mt-0.5">You</span>
            </div>
          )}

          {/* Previous trick won announcement overlay */}
          {previousTrick && currentTrick.cards.length === 0 && (
            <div className="text-center bg-black/80 backdrop-blur-sm border border-zinc-800 p-2.5 rounded-xl z-20">
              <div className="text-[11px] text-zinc-400 uppercase font-mono">Last Trick Winner</div>
              <div className="text-sm font-bold text-white flex items-center justify-center gap-1">
                <span>{previousTrick.winnerUsername}</span>
                <span className="text-zinc-300 font-mono">+{previousTrick.trickPoints} pts</span>
              </div>
            </div>
          )}

          {/* Empty center placeholder */}
          {!previousTrick && currentTrick.cards.length === 0 && (
            <div className="text-zinc-700 text-xs font-mono uppercase tracking-widest text-center">
              Trick Area
              {currentTrick.leadSuit && (
                <div className="text-zinc-400 text-sm mt-1">Lead: {SUIT_SYMBOLS[currentTrick.leadSuit]}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Logs Drawer (if toggled) */}
      {showLogs && (
        <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-xl p-3 my-2 text-xs font-mono max-h-36 overflow-y-auto">
          <div className="font-bold text-zinc-400 uppercase text-[10px] mb-1">Recent Game Events</div>
          <div className="space-y-1">
            {actionLogs.slice(-6).map((log) => (
              <div key={log.id} className="text-zinc-300">
                • {log.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Area: Turn Prompt, My Status & Hand */}
      <div className="w-full max-w-5xl mt-3 flex flex-col items-center">
        {/* Turn Prompt Banner */}
        <div className="mb-2 flex items-center justify-center">
          {isMyTurn ? (
            <div className="bg-white text-black px-4 py-1.5 rounded-full font-black text-xs sm:text-sm tracking-wide animate-pulse shadow-lg flex items-center gap-2">
              <span>YOUR TURN</span>
              <span className="font-normal font-mono text-zinc-700">
                {currentTrick.leadSuit
                  ? `(Must follow: ${currentTrick.leadSuit.toUpperCase()} ${SUIT_SYMBOLS[currentTrick.leadSuit]})`
                  : '(Lead any card)'}
              </span>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-4 py-1 rounded-full text-xs font-mono">
              Waiting for{' '}
              <strong className="text-white">
                {players.find((p) => p.id === currentTurnPlayerId)?.username || 'opponent'}
              </strong>{' '}
              to play...
            </div>
          )}
        </div>

        {/* My Player Info Badge */}
        <div className="mb-2">{renderPlayerBadge(me)}</div>

        {/* Cards in Hand */}
        <div className="w-full bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs text-zinc-400 font-mono px-2 mb-2">
            <span>
              Your Hand: <strong className="text-white">{me.hand.length} cards</strong>
            </span>
            <span>
              Card Points in Hand:{' '}
              <strong className="text-white">{me.hand.reduce((s, c) => s + c.points, 0)} pts</strong>
            </span>
          </div>

          {/* Fan / Horizontally Scrollable Hand of Cards */}
          <div className="w-full flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto py-2 px-1">
            {me.hand.map((card) => {
              const legal = isLegalPlay(card, me.hand, currentTrick.leadSuit);
              return (
                <CardView
                  key={card.id}
                  card={card}
                  isPlayable={isMyTurn && legal}
                  onClick={() => handleCardClick(card)}
                  size="md"
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
