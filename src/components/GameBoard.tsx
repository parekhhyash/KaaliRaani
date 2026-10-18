'use client';

import React, { useState, useEffect } from 'react';
import { RoomState, Card, Player } from '@/types/game';
import { CardView } from './CardView';
import { SUIT_SYMBOLS } from '@/lib/constants';
import { isLegalPlay } from '@/lib/deck';
import { sounds } from '@/lib/audio';
import { Crown, UserCheck, Bot, Sparkles, MessageSquare, Eye, EyeOff } from 'lucide-react';

interface GameBoardProps {
  state: RoomState;
  myPlayerId: string;
  isCardsHidden?: boolean;
  onToggleHideCards?: () => void;
  onPlayCard: (cardId: string) => void;
  onSendChat?: (text: string) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  state,
  myPlayerId,
  isCardsHidden = false,
  onToggleHideCards,
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
    totalTricks,
    actionLogs,
  } = state;

  const [showLogs, setShowLogs] = useState(false);
  const [peekCardId, setPeekCardId] = useState<string | null>(null);

  const me = players.find((p) => p.id === myPlayerId) || players[0];
  const isMyTurn = currentTurnPlayerId === myPlayerId;
  const opponents = players.filter((p) => p.id !== me.id);

  // Sound trigger on partner reveal
  useEffect(() => {
    if (isPartnerRevealed) {
      sounds.playPartnerReveal();
    }
  }, [isPartnerRevealed]);

  // Sound trigger on trick won
  useEffect(() => {
    if (currentTrick.winnerPlayerId) {
      sounds.playTrickWin();
    }
  }, [currentTrick.winnerPlayerId, currentTrick.trickNumber]);

  const handleCardClick = (card: Card) => {
    if (isCardsHidden) {
      if (peekCardId !== card.id) {
        sounds.playClick();
        setPeekCardId(card.id);
        return;
      }
    }

    if (!isMyTurn) return;
    if (isLegalPlay(card, me.hand, currentTrick.leadSuit)) {
      sounds.playCardPlay();
      setPeekCardId(null);
      onPlayCard(card.id);
    }
  };

  const renderPlayerBadge = (player: Player, compact: boolean = false) => {
    const isTurn = player.id === currentTurnPlayerId;
    const isDeclarer = player.id === declarerId;
    const isPartner = isPartnerRevealed && player.id === partnerId;
    const isOpponent = isPartnerRevealed && !isDeclarer && !isPartner;

    return (
      <div
        key={player.id}
        className={`flex items-center space-x-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border transition-all ${
          isTurn
            ? 'bg-zinc-900 border-white shadow-xl ring-2 ring-white/60 scale-[1.02]'
            : 'bg-zinc-950/90 border-zinc-800'
        }`}
      >
        <div
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black border ${
            isTurn ? 'border-white text-white' : 'border-zinc-700 text-zinc-400'
          } flex items-center justify-center font-bold text-xs`}
        >
          {player.isBot ? <Bot className="w-4 h-4 text-zinc-400" /> : player.seatIndex + 1}
        </div>

        <div className="flex flex-col text-left">
          <div className="flex items-center space-x-1.5 leading-none">
            <span
              className={`font-bold text-white text-xs sm:text-sm truncate ${
                compact ? 'max-w-[70px] sm:max-w-[110px]' : 'max-w-[90px] sm:max-w-[130px]'
              }`}
            >
              {player.username}
            </span>
            {isTurn && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
            {isDeclarer && (
              <span className="text-[9px] sm:text-[10px] bg-white text-black font-extrabold px-1 rounded flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5 fill-current" /> Dec
              </span>
            )}
            {isPartner && (
              <span className="text-[9px] sm:text-[10px] bg-zinc-300 text-black font-extrabold px-1 rounded flex items-center gap-0.5">
                <UserCheck className="w-2.5 h-2.5" /> Ptnr
              </span>
            )}
            {isOpponent && (
              <span className="text-[9px] sm:text-[10px] bg-zinc-800 text-zinc-400 px-1 rounded border border-zinc-700">
                Def
              </span>
            )}
          </div>

          <div className="text-[10px] sm:text-[11px] text-zinc-400 font-mono mt-1 flex items-center gap-1.5">
            <span>{player.hand.length} cards</span>
            <span>•</span>
            <span className="text-zinc-200 font-semibold">{player.cardPointsCollected} pts</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-between min-h-[calc(100vh-100px)] text-white px-2 sm:px-4 py-2 select-none">
      {/* Top HUD: Trump, Partner Card, Target Bid */}
      <div className="w-full bg-zinc-950/90 border border-zinc-800 rounded-2xl px-3 sm:px-4 py-2 mb-2 flex flex-wrap items-center justify-between gap-2.5 text-xs sm:text-sm font-mono shadow-xl">
        <div className="flex items-center space-x-3 sm:space-x-4">
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

        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Target */}
          <div>
            <span className="text-zinc-500 uppercase text-[11px]">Target: </span>
            <span className="text-white font-bold">{highestBid} pts</span>
          </div>

          {/* Trick Number */}
          <div className="bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded text-zinc-300">
            Trick <strong className="text-white">{currentTrick.trickNumber}</strong> / {totalTricks || 13}
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
        <div className="w-full bg-white text-black py-1.5 px-4 rounded-xl mb-2 flex items-center justify-center space-x-2 text-xs font-black uppercase tracking-wider animate-in fade-in shadow-xl">
          <Sparkles className="w-4 h-4 fill-current" />
          <span>
            Partner Revealed: {players.find((p) => p.id === partnerId)?.username} holds the {calledCard?.rank} of{' '}
            {calledCard?.suit}!
          </span>
        </div>
      )}

      {/* MAIN PLAYING BOARD CONTAINER */}
      <div className="w-full flex flex-col items-center">
        {/* OPPONENTS RAIL (Clean responsive row above the table felt - NEVER overlaps cards!) */}
        <div className="w-full flex flex-wrap items-center justify-center gap-2 mb-2">
          {opponents.map((player) => renderPlayerBadge(player, true))}
        </div>

        {/* CENTER TRICK FELT ARENA (Dedicated space for current played cards) */}
        <div className="w-full max-w-3xl min-h-[200px] sm:min-h-[240px] bg-zinc-950 border border-zinc-800/90 rounded-3xl shadow-2xl relative flex flex-col items-center justify-center p-3 sm:p-5 overflow-hidden my-1">
          {/* Subtle table felt decorative lines */}
          <div className="absolute inset-3 border border-zinc-900 rounded-2xl pointer-events-none" />
          <div className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-zinc-900 pointer-events-none" />

          {/* 1. If cards have been played in current trick */}
          {currentTrick.cards.length > 0 && (
            <div className="flex flex-col items-center z-10 w-full px-2">
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 w-full">
                {currentTrick.cards.map((play, idx) => {
                  const isLead = idx === 0;
                  const isMe = play.playerId === me.id;
                  const isWinner = play.playerId === currentTrick.winnerPlayerId;
                  return (
                    <div
                      key={play.playerId}
                      className={`flex flex-col items-center animate-in zoom-in-95 duration-150 transition-all ${
                        isWinner ? 'scale-105' : ''
                      }`}
                    >
                      <div className={`relative rounded-xl ${isWinner ? 'ring-2 ring-white shadow-2xl shadow-white/30' : ''}`}>
                        <CardView card={play.card} size="sm" isPlayable={false} />
                        {isLead && !isWinner && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-1.5 py-0.2 rounded shadow uppercase font-mono">
                            Lead
                          </span>
                        )}
                        {isWinner && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg uppercase font-mono flex items-center gap-0.5 whitespace-nowrap">
                            👑 Won
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs font-mono mt-1 px-1.5 py-0.5 rounded truncate max-w-[80px] sm:max-w-[100px] text-center ${
                          isWinner
                            ? 'bg-white text-black font-extrabold'
                            : isMe
                            ? 'bg-zinc-800 text-white font-bold'
                            : 'text-zinc-300 bg-zinc-900/90 border border-zinc-800'
                        }`}
                      >
                        {isMe ? 'You' : play.playerUsername}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Winner Announcement Banner during pause */}
              {currentTrick.winnerPlayerId && (
                <div className="mt-3.5 px-4 py-1.5 rounded-full bg-white text-black font-black text-xs sm:text-sm animate-pulse shadow-2xl flex items-center gap-1.5">
                  <Crown className="w-4 h-4 fill-current" />
                  <span>
                    {currentTrick.winnerUsername} won Trick {currentTrick.trickNumber}! (+{currentTrick.trickPoints} card pts)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 2. Previous trick winner banner (between tricks) */}
          {previousTrick && currentTrick.cards.length === 0 && (
            <div className="text-center bg-black/90 backdrop-blur-sm border border-zinc-800 px-4 py-3 rounded-2xl z-20 animate-in zoom-in-95 shadow-xl">
              <div className="text-[11px] text-zinc-400 uppercase font-mono tracking-wider">
                Last Trick Winner
              </div>
              <div className="text-base font-extrabold text-white flex items-center justify-center gap-1.5 mt-0.5">
                <span>👑 {previousTrick.winnerUsername}</span>
                <span className="text-zinc-300 font-mono text-sm">
                  (+{previousTrick.trickPoints} pts)
                </span>
              </div>
            </div>
          )}

          {/* 3. Empty center placeholder when starting a trick */}
          {!previousTrick && currentTrick.cards.length === 0 && (
            <div className="text-zinc-700 text-xs font-mono uppercase tracking-widest text-center z-10">
              Trick Area
              {currentTrick.leadSuit && (
                <div className="text-zinc-400 text-sm mt-1 normal-case">
                  Lead Suit: {SUIT_SYMBOLS[currentTrick.leadSuit]} {currentTrick.leadSuit}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Logs Drawer (if toggled) */}
      {showLogs && (
        <div className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-xl p-3 my-2 text-xs font-mono max-h-36 overflow-y-auto">
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

      {/* BOTTOM AREA: TURN PROMPT, MY BADGE, & HAND */}
      <div className="w-full max-w-5xl mt-2 flex flex-col items-center">
        {/* Turn Prompt Banner */}
        <div className="mb-2 flex items-center justify-center">
          {currentTrick.winnerPlayerId ? (
            <div className="bg-zinc-900 border border-zinc-700 text-zinc-300 px-4 py-1.5 rounded-full text-xs font-mono flex items-center gap-2 shadow">
              <span className="inline-block animate-spin text-white">♠</span>
              <span>Trick complete! Starting next play in a moment...</span>
            </div>
          ) : isMyTurn ? (
            <div className="bg-white text-black px-4 py-1.5 rounded-full font-black text-xs sm:text-sm tracking-wide animate-pulse shadow-lg flex items-center gap-2">
              <span>YOUR TURN</span>
              <span className="font-normal font-mono text-zinc-700 text-xs">
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
        <div className="w-full bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-2.5 sm:p-4 shadow-2xl flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs text-zinc-400 font-mono px-2 mb-2">
            <div className="flex items-center space-x-2">
              <span>
                Your Hand: <strong className="text-white">{me.hand.length} cards</strong>
              </span>
              {onToggleHideCards && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onToggleHideCards();
                  }}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                    isCardsHidden
                      ? 'bg-white text-black border-white font-bold shadow'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-700'
                  }`}
                  title={isCardsHidden ? 'Show cards' : 'Hide cards from nearby viewers'}
                >
                  {isCardsHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{isCardsHidden ? 'Show Cards' : 'Hide Cards'}</span>
                </button>
              )}
            </div>
            <div>
              Card Points:{' '}
              <strong className="text-white">
                {isCardsHidden ? '••••' : `${me.hand.reduce((s, c) => s + c.points, 0)} pts`}
              </strong>
            </div>
          </div>

          {/* Helper when hidden */}
          {isCardsHidden && (
            <div className="text-[11px] text-zinc-500 font-mono mb-2 flex items-center gap-1.5">
              <span>🔒 Cards hidden for privacy. Click a card to peek, or toggle 'Show Cards'.</span>
            </div>
          )}

          {/* Fan / Horizontally Scrollable Hand of Cards */}
          <div className="w-full flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto py-2 px-1">
            {me.hand.map((card) => {
              const legal = isLegalPlay(card, me.hand, currentTrick.leadSuit);
              const isHidden = isCardsHidden && peekCardId !== card.id;

              return (
                <CardView
                  key={card.id}
                  card={card}
                  isFaceDown={isHidden}
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
