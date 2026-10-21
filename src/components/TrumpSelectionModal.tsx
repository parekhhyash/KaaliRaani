'use client';

import React, { useState } from 'react';
import { Card, Suit, Rank } from '@/types/game';
import { SUITS, RANKS, SUIT_SYMBOLS, CARD_POINTS } from '@/lib/constants';
import { CardView } from './CardView';
import { sounds } from '@/lib/audio';
import { Check, Shield, UserCheck, Eye, EyeOff } from 'lucide-react';

interface TrumpSelectionModalProps {
  isDeclarer: boolean;
  declarerUsername: string;
  highestBid: number;
  totalPlayers?: number;
  myHand: Card[];
  isCardsHidden?: boolean;
  onToggleHideCards?: () => void;
  onConfirm: (trumpSuit: Suit, calledCard: Card) => void;
}

export const TrumpSelectionModal: React.FC<TrumpSelectionModalProps> = ({
  isDeclarer,
  declarerUsername,
  highestBid,
  totalPlayers = 4,
  myHand,
  isCardsHidden = false,
  onToggleHideCards,
  onConfirm,
}) => {
  const [selectedSuit, setSelectedSuit] = useState<Suit>('spades');

  // Choose an initial partner card that is not in the player's hand
  const [partnerSuit, setPartnerSuit] = useState<Suit>(() => {
    if (!myHand.some((c) => c.id === 'spades-Q')) return 'spades';
    for (const s of ['hearts', 'diamonds', 'clubs', 'spades'] as Suit[]) {
      if (!myHand.some((c) => c.suit === s && c.rank === 'A')) return s;
    }
    return 'hearts';
  });

  const [partnerRank, setPartnerRank] = useState<Rank>(() => {
    if (!myHand.some((c) => c.id === 'spades-Q')) return 'Q';
    for (const s of ['hearts', 'diamonds', 'clubs', 'spades'] as Suit[]) {
      if (!myHand.some((c) => c.suit === s && c.rank === 'A')) return 'A';
    }
    return 'K';
  });

  const calledCardId = `${partnerSuit}-${partnerRank}`;
  const calledCard: Card = {
    id: calledCardId,
    suit: partnerSuit,
    rank: partnerRank,
    points: CARD_POINTS[calledCardId] || 0,
  };

  const safePlayers = Math.max(2, Math.min(6, totalPlayers));
  const remainder = 52 % safePlayers;
  const twosOrder = ['clubs-2', 'diamonds-2', 'hearts-2', 'spades-2'];
  const removedCardIds = new Set(twosOrder.slice(0, remainder));
  const isCardRemoved = removedCardIds.has(calledCardId);
  const isCardInMyHand = myHand.some((c) => c.id === calledCardId);

  const handleConfirm = () => {
    if (isCardRemoved || isCardInMyHand) return;
    sounds.playTrump();
    onConfirm(selectedSuit, calledCard);
  };

  if (!isDeclarer) {
    return (
      <div className="w-full max-w-2xl mx-auto my-12 p-8 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl text-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center mx-auto mb-4 animate-bounce">
          ♠
        </div>
        <h2 className="text-xl font-bold tracking-tight">Declarer Setup in Progress</h2>
        <p className="text-sm text-zinc-400 mt-2">
          <strong className="text-white">{declarerUsername}</strong> won the bid at{' '}
          <strong className="text-white font-mono">{highestBid} points</strong> and is choosing the Trump (Hukum) and
          the Hidden Partner card...
        </p>

        {/* Hand Preview */}
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs uppercase font-mono text-zinc-400">Your Hand ({myHand.length} cards)</span>
            {onToggleHideCards && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onToggleHideCards();
                }}
                className={`flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
                  isCardsHidden
                    ? 'bg-white text-black border-white font-bold shadow'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-700'
                }`}
                title={isCardsHidden ? 'Show cards' : 'Hide cards'}
              >
                {isCardsHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{isCardsHidden ? 'Show Cards' : 'Hide Cards'}</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 py-2">
            {myHand.map((card) => (
              <CardView
                key={card.id}
                card={card}
                isFaceDown={isCardsHidden}
                isPlayable={isCardsHidden}
                onClick={
                  isCardsHidden && onToggleHideCards
                    ? () => {
                        sounds.playClick();
                        onToggleHideCards();
                      }
                    : undefined
                }
                size="sm"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto my-6 p-6 sm:p-8 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl text-white">
      <div className="border-b border-zinc-800 pb-4 mb-6">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white text-black text-xs font-extrabold mb-2">
          <span>Auction Winner</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight">Choose Trump (Hukum) & Partner Card</h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Winning Bid: <strong className="text-white font-mono">{highestBid} points</strong>. Select the trump suit and
          call any card to identify your teammate.
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Select Trump Suit */}
        <div>
          <label className="block text-xs uppercase font-mono tracking-wider text-zinc-300 mb-2.5 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-white" />
            Step 1: Choose Hukkum (Trump Suit)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SUITS.map((suit) => {
              const isSelected = selectedSuit === suit;
              return (
                <button
                  key={suit}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedSuit(suit);
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-white text-black border-white shadow-xl scale-[1.02]'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-white'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl font-black mb-1">{SUIT_SYMBOLS[suit]}</span>
                  <span className="text-xs font-bold uppercase tracking-wider">{suit}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Call Partner Card */}
        <div className="pt-2">
          <label className="block text-xs uppercase font-mono tracking-wider text-zinc-300 mb-2.5 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-white" />
            Step 2: Call Partner Card (Whoever holds this card is your secret partner!)
          </label>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-6">
            {/* Left Card Preview */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <CardView card={calledCard} isPlayable={false} size="md" />
                {isCardInMyHand && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase font-mono whitespace-nowrap">
                    In Your Hand
                  </span>
                )}
                {isCardRemoved && !isCardInMyHand && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase font-mono whitespace-nowrap">
                    Removed
                  </span>
                )}
              </div>
              <span className="text-xs font-mono text-zinc-400 mt-2">Called Card</span>
            </div>

            {/* Suit & Rank Selectors */}
            <div className="flex-1 w-full space-y-3">
              {/* Suit Selector */}
              <div>
                <span className="text-[11px] uppercase font-mono text-zinc-400 block mb-1">Partner Card Suit:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SUITS.map((suit) => (
                    <button
                      key={suit}
                      onClick={() => {
                        sounds.playClick();
                        setPartnerSuit(suit);
                      }}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        partnerSuit === suit
                          ? 'bg-white text-black border-white shadow'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      <span className="text-base font-bold">{SUIT_SYMBOLS[suit]}</span>
                      <span className="capitalize">{suit}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rank Selector */}
              <div>
                <span className="text-[11px] uppercase font-mono text-zinc-400 block mb-1">
                  Partner Card Rank (cards in your hand cannot be chosen):
                </span>
                <div className="grid grid-cols-7 sm:grid-cols-7 gap-1">
                  {RANKS.map((rank) => {
                    const cardId = `${partnerSuit}-${rank}`;
                    const inHand = myHand.some((c) => c.id === cardId);
                    const isRemoved = removedCardIds.has(cardId);

                    return (
                      <button
                        key={rank}
                        onClick={() => {
                          sounds.playClick();
                          setPartnerRank(rank);
                        }}
                        className={`py-1.5 rounded-lg border text-xs font-bold font-mono transition-all relative ${
                          partnerRank === rank
                            ? 'bg-white text-black border-white'
                            : inHand
                            ? 'bg-zinc-950 text-zinc-600 border-zinc-900 line-through'
                            : isRemoved
                            ? 'bg-zinc-950 text-zinc-700 border-zinc-900 opacity-40 line-through'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                        }`}
                        title={
                          inHand
                            ? `${rank} of ${partnerSuit} is in your hand (cannot be chosen)`
                            : isRemoved
                            ? `${rank} of ${partnerSuit} was removed from deck`
                            : undefined
                        }
                      >
                        {rank}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hand Preview to avoid calling your own card unintentionally */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono text-zinc-400">
              Your Hand (You hold these {myHand.length} cards — cannot be chosen as partner):
            </span>
            {onToggleHideCards && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onToggleHideCards();
                }}
                className={`flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
                  isCardsHidden
                    ? 'bg-white text-black border-white font-bold shadow'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-700'
                }`}
                title={isCardsHidden ? 'Show cards' : 'Hide cards'}
              >
                {isCardsHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{isCardsHidden ? 'Show Cards' : 'Hide Cards'}</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 overflow-x-auto py-1">
            {myHand.map((card) => {
              const isSelectedInHand = card.id === calledCardId;
              return (
                <div key={card.id} className="relative">
                  <CardView
                    card={card}
                    isFaceDown={isCardsHidden}
                    isPlayable={isCardsHidden}
                    onClick={
                      isCardsHidden && onToggleHideCards
                        ? () => {
                            sounds.playClick();
                            onToggleHideCards();
                          }
                        : undefined
                    }
                    size="sm"
                  />
                  {isSelectedInHand && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full shadow uppercase font-mono whitespace-nowrap">
                      In Hand
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Confirm Button */}
        <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {isCardRemoved ? (
            <div className="text-xs text-rose-400 font-mono">
              ⚠️ {calledCard.rank} of {calledCard.suit} was removed from the deck to distribute cards evenly among {totalPlayers} players. Please pick another card.
            </div>
          ) : isCardInMyHand ? (
            <div className="text-xs text-rose-400 font-mono">
              ⚠️ You hold {calledCard.rank} of {calledCard.suit} in your hand! You cannot choose your own card as your partner.
            </div>
          ) : (
            <div className="text-xs text-zinc-500 font-mono">
              The player holding this card will be your secret teammate.
            </div>
          )}
          <button
            onClick={handleConfirm}
            disabled={isCardRemoved || isCardInMyHand}
            className="w-full sm:w-auto px-8 py-3 bg-white text-black font-extrabold rounded-xl hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center space-x-2 shadow-xl hover:scale-[1.01]"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Hukum & Start Playing</span>
          </button>
        </div>
      </div>
    </div>
  );
};
