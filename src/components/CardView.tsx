'use client';

import React from 'react';
import { Card } from '@/types/game';
import { SUIT_SYMBOLS } from '@/lib/constants';

interface CardViewProps {
  card?: Card;
  isFaceDown?: boolean;
  isPlayable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  isFaceDown = false,
  isPlayable = true,
  isSelected = false,
  onClick,
  size = 'md',
  className = '',
}) => {
  if (isFaceDown || !card) {
    // Face-down card representation
    const sizeClasses = {
      sm: 'w-12 h-16 text-xs',
      md: 'w-16 h-24 text-sm sm:w-20 sm:h-28 sm:text-base',
      lg: 'w-24 h-36 text-lg',
    }[size];

    return (
      <div
        onClick={onClick}
        className={`${sizeClasses} bg-zinc-950 border border-zinc-700/80 rounded-xl flex items-center justify-center relative overflow-hidden shadow-md select-none transition-all duration-150 ${
          onClick ? 'cursor-pointer hover:border-zinc-500' : ''
        } ${className}`}
      >
        <div className="absolute inset-1.5 border border-zinc-800 rounded-lg flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
          <div className="w-6 h-6 rounded-full border border-zinc-700 flex items-center justify-center text-xs text-zinc-500 font-mono shadow-inner">
            ♠
          </div>
        </div>
      </div>
    );
  }

  const { rank, suit, points, id } = card;
  const isKaaliRaani = id === 'spades-Q';

  const sizeClasses = {
    sm: 'w-12 h-16 p-1 text-xs',
    md: 'w-16 h-24 p-1.5 text-sm sm:w-20 sm:h-28 sm:p-2 sm:text-base',
    lg: 'w-24 h-36 p-2.5 text-lg',
  }[size];

  const symbol = SUIT_SYMBOLS[suit];

  return (
    <div
      onClick={isPlayable && onClick ? onClick : undefined}
      className={`
        ${sizeClasses}
        relative select-none rounded-xl transition-all duration-150 flex flex-col justify-between
        ${isKaaliRaani ? 'bg-gradient-to-b from-zinc-900 to-black border-2 border-white' : 'bg-zinc-900 border border-zinc-700'}
        ${isPlayable ? 'cursor-pointer hover:-translate-y-2 hover:border-white hover:shadow-xl hover:shadow-white/10' : 'opacity-40 cursor-not-allowed'}
        ${isSelected ? '-translate-y-3 ring-2 ring-white shadow-2xl shadow-white/20' : ''}
        ${className}
      `}
    >
      {/* Top Left Rank & Suit */}
      <div className="flex flex-col items-start leading-none font-bold text-white">
        <span className="tracking-tight">{rank}</span>
        <span className="text-xs sm:text-sm text-zinc-300">{symbol}</span>
      </div>

      {/* Center Suit Symbol / Queen Special Badge */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className={`leading-none font-black text-white ${size === 'lg' ? 'text-4xl' : 'text-2xl sm:text-3xl'}`}>
          {symbol}
        </span>
        {isKaaliRaani && (
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-black bg-white px-1 rounded mt-0.5 shadow">
            Kaali Raani
          </span>
        )}
      </div>

      {/* Bottom Right Rank & Points Pill */}
      <div className="flex items-end justify-between leading-none w-full">
        {points > 0 ? (
          <span
            className={`text-[9px] sm:text-[10px] font-mono font-bold px-1 rounded ${
              isKaaliRaani
                ? 'bg-white text-black font-extrabold'
                : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
            }`}
          >
            +{points}
          </span>
        ) : (
          <span />
        )}
        <div className="flex flex-col items-end leading-none font-bold text-zinc-400 rotate-180">
          <span>{rank}</span>
        </div>
      </div>
    </div>
  );
};
