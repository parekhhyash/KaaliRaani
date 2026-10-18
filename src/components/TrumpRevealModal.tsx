'use client';

import React, { useState, useEffect } from 'react';
import { Suit, Card, Rank } from '@/types/game';
import { SUIT_SYMBOLS } from '@/lib/constants';
import { sounds } from '@/lib/audio';

interface TrumpRevealModalProps {
  trumpSuit: Suit;
  calledCard: Card;
  onComplete?: () => void;
}

const SUIT_LABELS: Record<Suit, { name: string; color: string; bgGlow: string }> = {
  spades: { name: 'SPADES', color: 'text-white', bgGlow: 'from-zinc-900/60' },
  clubs: { name: 'CLUBS', color: 'text-white', bgGlow: 'from-zinc-900/60' },
  hearts: { name: 'HEARTS', color: 'text-rose-500', bgGlow: 'from-rose-950/50' },
  diamonds: { name: 'DIAMONDS', color: 'text-rose-500', bgGlow: 'from-rose-950/50' },
};

const RANK_LABELS: Record<Rank, string> = {
  A: 'Ace',
  K: 'King',
  Q: 'Queen',
  J: 'Jack',
  '10': '10',
  '9': '9',
  '8': '8',
  '7': '7',
  '6': '6',
  '5': '5',
  '4': '4',
  '3': '3',
  '2': '2',
};

export const TrumpRevealModal: React.FC<TrumpRevealModalProps> = ({
  trumpSuit,
  calledCard,
  onComplete,
}) => {
  const [stage, setStage] = useState<'hukkum' | 'partner'>('hukkum');
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Play sound for Hukkum reveal
    sounds.playTrumpReveal();

    // Transition to Partner card reveal after 2.4s
    const partnerTimer = setTimeout(() => {
      setStage('partner');
      sounds.playPartnerReveal();
    }, 2400);

    // Start exit fade at 4.9s
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 4900);

    // Complete reveal and start game at 5.2s
    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 5200);

    return () => {
      clearTimeout(partnerTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const hukkumInfo = SUIT_LABELS[trumpSuit] || SUIT_LABELS.spades;
  const isPartnerRed = calledCard.suit === 'hearts' || calledCard.suit === 'diamonds';
  const partnerSymbol = SUIT_SYMBOLS[calledCard.suit];
  const partnerSuitName = SUIT_LABELS[calledCard.suit]?.name || calledCard.suit.toUpperCase();
  const partnerRankName = RANK_LABELS[calledCard.rank] || calledCard.rank;
  const isKaaliRaani = calledCard.id === 'spades-Q';

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 select-none transition-opacity duration-300 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Dynamic ambient radial glow */}
      <div
        className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${
          stage === 'hukkum' ? hukkumInfo.bgGlow : isPartnerRed ? 'from-rose-950/50' : 'from-zinc-900/60'
        } via-black/80 to-black pointer-events-none transition-all duration-700`}
      />

      {/* STAGE 1: THE HUKKUM IS */}
      {stage === 'hukkum' && (
        <div
          key="hukkum-stage"
          className="relative z-10 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500"
        >
          <p className="text-xl sm:text-2xl md:text-3xl font-mono uppercase tracking-[0.25em] text-zinc-400 font-light mb-8 sm:mb-12">
            The Hukkum is
          </p>

          <div
            className={`w-32 h-32 sm:w-44 sm:h-44 rounded-3xl bg-zinc-950/90 border-2 border-white/20 shadow-[0_0_80px_rgba(255,255,255,0.15)] flex items-center justify-center mb-6 sm:mb-8 transition-transform duration-500 scale-100 hover:scale-105`}
          >
            <span className={`text-7xl sm:text-9xl leading-none font-black ${hukkumInfo.color} drop-shadow-2xl`}>
              {SUIT_SYMBOLS[trumpSuit]}
            </span>
          </div>

          <h2 className={`text-3xl sm:text-5xl font-black tracking-widest ${hukkumInfo.color} drop-shadow-lg`}>
            {hukkumInfo.name}
          </h2>
        </div>
      )}

      {/* STAGE 2: THE PARTNER CARD IS */}
      {stage === 'partner' && (
        <div
          key="partner-stage"
          className="relative z-10 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500"
        >
          <p className="text-xl sm:text-2xl md:text-3xl font-mono uppercase tracking-[0.25em] text-zinc-400 font-light mb-8 sm:mb-10">
            The Partner card is
          </p>

          {/* Large Hero Card */}
          <div
            className={`w-44 h-64 sm:w-56 sm:h-80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_0_80px_rgba(255,255,255,0.25)] relative overflow-hidden transition-all duration-500 ${
              isKaaliRaani
                ? 'bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-white'
                : 'bg-zinc-950 border-2 border-white/80'
            }`}
          >
            {/* Top Left Rank & Symbol */}
            <div className={`flex flex-col items-start leading-none font-black ${isPartnerRed ? 'text-rose-500' : 'text-white'}`}>
              <span className="text-2xl sm:text-3xl tracking-tight">{calledCard.rank}</span>
              <span className="text-lg sm:text-xl mt-0.5">{partnerSymbol}</span>
            </div>

            {/* Center Symbol / Kaali Raani Emblem */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span
                className={`leading-none font-black ${isPartnerRed ? 'text-rose-500' : 'text-white'} text-6xl sm:text-8xl drop-shadow-2xl`}
              >
                {partnerSymbol}
              </span>
              {isKaaliRaani && (
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-black bg-white px-2 py-0.5 rounded-md mt-2 shadow-lg">
                  Kaali Raani
                </span>
              )}
            </div>

            {/* Bottom Right Rank & Points */}
            <div className="flex items-end justify-between leading-none w-full">
              {calledCard.points > 0 ? (
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    isKaaliRaani
                      ? 'bg-white text-black font-extrabold'
                      : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                  }`}
                >
                  {calledCard.points} PTS
                </span>
              ) : (
                <div />
              )}
              <div className={`flex flex-col items-end leading-none font-black ${isPartnerRed ? 'text-rose-500' : 'text-white'}`}>
                <span className="text-2xl sm:text-3xl tracking-tight">{calledCard.rank}</span>
                <span className="text-lg sm:text-xl mt-0.5">{partnerSymbol}</span>
              </div>
            </div>
          </div>

          {/* Card Label below card */}
          <h2 className="text-2xl sm:text-4xl font-black tracking-wide text-white mt-6 sm:mt-8 drop-shadow-lg">
            {partnerRankName} of {partnerSuitName}
          </h2>
        </div>
      )}
    </div>
  );
};
