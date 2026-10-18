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
  myHand: Card[];
  isCardsHidden?: boolean;
  onToggleHideCards?: () => void;
  onConfirm: (trumpSuit: Suit, calledCard: Card) => void;
}

export const TrumpSelectionModal: React.FC<TrumpSelectionModalProps> = ({
  isDeclarer,
  declarerUsername,
  highestBid,
  myHand,
  isCardsHidden = false,
  onToggleHideCards,
  onConfirm,
}) => {
  const [selectedSuit, setSelectedSuit] = useState<Suit>('spades');
  const [partnerSuit, setPartnerSuit] = useState<Suit>('hearts');
  const [partnerRank, setPartnerRank] = useState<Rank>('A');

  const calledCardId = `${partnerSuit}-${partnerRank}`;
  const calledCard: Card = {
    id: calledCardId,
    suit: partnerSuit,
    rank: partnerRank,
    points: CARD_POINTS[calledCardId] || 0,
  };

  const handleConfirm = () => {
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
                isPlayable={false}
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
              <CardView card={calledCard} isPlayable={false} size="md" />
              <span className="text-xs font-mono text-zinc-400 mt-2">Called Card</span>
            </div>

            {/* Suit & Rank Selectors */}
            <div className="flex-1 w-full space-y-3">
              {/* Suit Selector */}
              <div>
                <span className="text-[11px] uppercase font-mono text-zinc-400 block mb-1">Partner Card Suit:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {SUITS.map((suit) => (
                    <button
                      key={suit}
                      onClick={() => {
                        sounds.playClick();
                        setPartnerSuit(suit);
                      }}
                      className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        partnerSuit === suit
                          ? 'bg-white text-black border-white'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {SUIT_SYMBOLS[suit]} {suit.slice(0, 4)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rank Selector */}
              <div>
                <span className="text-[11px] uppercase font-mono text-zinc-400 block mb-1">Partner Card Rank:</span>
                <div className="grid grid-cols-7 sm:grid-cols-7 gap-1">
                  {RANKS.map((rank) => (
                    <button
                      key={rank}
                      onClick={() => {
                        sounds.playClick();
                        setPartnerRank(rank);
                      }}
                      className={`py-1.5 rounded-lg border text-xs font-bold font-mono transition-all ${
                        partnerRank === rank
                          ? 'bg-white text-black border-white'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {rank}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hand Preview to avoid calling your own card unintentionally */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono text-zinc-400">
              Your Hand (You hold these {myHand.length} cards):
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
            {myHand.map((card) => (
              <CardView
                key={card.id}
                card={card}
                isFaceDown={isCardsHidden}
                isPlayable={false}
                size="sm"
              />
            ))}
          </div>
        </div>

        {/* Confirm Button */}
        <div className="pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-8 py-3 bg-white text-black font-extrabold rounded-xl hover:bg-zinc-200 transition-all text-sm flex items-center justify-center space-x-2 shadow-xl hover:scale-[1.01]"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Hukum & Start Playing</span>
          </button>
        </div>
      </div>
    </div>
  );
};
