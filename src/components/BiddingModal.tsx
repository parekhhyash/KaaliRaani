'use client';

import React, { useState, useEffect } from 'react';
import { Player, Card } from '@/types/game';
import { CardView } from './CardView';
import { sounds } from '@/lib/audio';
import { ArrowUp, Eye, EyeOff } from 'lucide-react';

interface BiddingModalProps {
  currentBidderId?: string;
  highestBid: number;
  highestBidderId?: string;
  myPlayerId: string;
  players: Player[];
  minBid: number;
  bidIncrement: number;
  maxBid: number;
  myHand: Card[];
  isCardsHidden?: boolean;
  onToggleHideCards?: () => void;
  onPlaceBid: (amount: number) => void;
  onPassBid: () => void;
}

export const BiddingModal: React.FC<BiddingModalProps> = ({
  currentBidderId,
  highestBid,
  highestBidderId,
  myPlayerId,
  players,
  minBid,
  bidIncrement,
  maxBid,
  myHand,
  isCardsHidden = false,
  onToggleHideCards,
  onPlaceBid,
  onPassBid,
}) => {
  const isMyTurn = currentBidderId === myPlayerId;
  const currentBidder = players.find((p) => p.id === currentBidderId);
  const highestBidder = players.find((p) => p.id === highestBidderId);

  const minNextBid = highestBid === 0 ? minBid : highestBid + bidIncrement;
  const [selectedBid, setSelectedBid] = useState<number>(minNextBid);

  useEffect(() => {
    setSelectedBid(minNextBid);
  }, [highestBid, minNextBid]);

  const handleBidSubmit = () => {
    if (selectedBid >= minNextBid && selectedBid <= maxBid) {
      sounds.playBid();
      onPlaceBid(selectedBid);
    }
  };

  const handlePass = () => {
    sounds.playPass();
    onPassBid();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-white pb-6">
      {/* Bidding Status Card */}
      <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div>
            <div className="text-xs uppercase font-mono tracking-wider text-zinc-400">Auction / Bidding Phase</div>
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                {highestBid === 0 ? 'No Bids Yet' : `${highestBid} pts`}
              </span>
              {highestBidder && (
                <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded border border-zinc-700 font-mono">
                  by {highestBidder.username}
                </span>
              )}
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="text-xs uppercase font-mono tracking-wider text-zinc-400">Current Turn</div>
            <div className="mt-1">
              {isMyTurn ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white text-black font-extrabold text-sm animate-pulse">
                  Your Turn to Bid
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold text-sm">
                  Waiting for {currentBidder?.username || 'player'}...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Players Bidding Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3 py-4 border-b border-zinc-800/80">
          {players.map((p) => {
            const isTurn = p.id === currentBidderId;
            const isHighest = p.id === highestBidderId;

            return (
              <div
                key={p.id}
                className={`p-3 rounded-xl border transition-all ${
                  isTurn
                    ? 'bg-zinc-900 border-white shadow-lg'
                    : p.hasPassedBid
                    ? 'bg-zinc-950/40 border-zinc-900 opacity-50'
                    : 'bg-zinc-950 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white truncate">{p.username}</span>
                  {p.id === myPlayerId && (
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1 rounded">You</span>
                  )}
                </div>
                <div className="font-mono text-xs">
                  {p.hasPassedBid ? (
                    <span className="text-zinc-500 line-through">Passed</span>
                  ) : isHighest ? (
                    <span className="text-white font-bold">{p.currentBid} pts (Highest)</span>
                  ) : p.currentBid > 0 ? (
                    <span className="text-zinc-400">{p.currentBid} pts</span>
                  ) : (
                    <span className="text-zinc-600">Pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Bidding Controls (Active only when isMyTurn) */}
        {isMyTurn && (
          <div className="pt-5 flex flex-col items-center">
            <div className="text-xs text-zinc-400 uppercase font-mono mb-3">
              Minimum Bid: <strong className="text-white">{minNextBid}</strong> (Max: {maxBid})
            </div>

            {/* Quick Raise Increments */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {[minNextBid, minNextBid + 5, minNextBid + 10, minNextBid + 15].map(
                (amt) =>
                  amt <= maxBid && (
                    <button
                      key={amt}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedBid(amt);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-mono text-sm font-bold border transition-all ${
                        selectedBid === amt
                          ? 'bg-white text-black border-white shadow'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500'
                      }`}
                    >
                      {amt}
                    </button>
                  )
              )}
            </div>

            {/* Custom Input & Action Buttons */}
            <div className="flex items-center space-x-3 w-full max-w-sm">
              <input
                type="number"
                min={minNextBid}
                max={maxBid}
                step={bidIncrement}
                value={selectedBid}
                onChange={(e) => setSelectedBid(Number(e.target.value))}
                className="w-24 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 font-mono text-center text-white font-bold focus:outline-none focus:border-white"
              />

              <button
                onClick={handleBidSubmit}
                disabled={selectedBid < minNextBid || selectedBid > maxBid}
                className="flex-1 flex items-center justify-center space-x-1.5 bg-white text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed py-2.5 rounded-xl font-bold text-sm transition-all shadow"
              >
                <ArrowUp className="w-4 h-4" />
                <span>Bid {selectedBid}</span>
              </button>

              <button
                onClick={handlePass}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 rounded-xl font-bold text-sm transition-all"
              >
                Pass
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hand Preview Area */}
      <div className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-mono text-zinc-400 tracking-wider">
              Your Hand ({myHand.length} cards)
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
                title={isCardsHidden ? 'Show cards' : 'Hide cards from nearby viewers'}
              >
                {isCardsHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{isCardsHidden ? 'Show Cards' : 'Hide Cards'}</span>
              </button>
            )}
          </div>
          <div className="text-xs font-mono text-zinc-400">
            Points in Hand:{' '}
            <strong className="text-white">
              {isCardsHidden ? '••••' : `${myHand.reduce((sum, c) => sum + c.points, 0)} pts`}
            </strong>
          </div>
        </div>

        {/* Fan / Horizontally Scrollable Hand of Cards */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto py-2">
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
};
