'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, BookOpen, Trophy } from 'lucide-react';

interface NavbarProps {
  roomCode: string;
  currentRound: number;
  totalRounds: number;
  isInRoom?: boolean;
  onOpenRules: () => void;
  onOpenLeaderboard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  roomCode,
  currentRound,
  totalRounds,
  isInRoom = false,
  onOpenRules,
  onOpenLeaderboard,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const copyRoomCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyInviteLink = () => {
    if (!roomCode || typeof window === 'undefined') return;
    const url = `${window.location.origin}/?room=${roomCode}`;
    if (navigator.share) {
      navigator
        .share({
          title: 'Join Kaali Raani Card Game',
          text: `Join my Kaali Raani (Black Queen) game! Room code: ${roomCode}`,
          url,
        })
        .catch(() => {
          navigator.clipboard.writeText(url);
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 2000);
        });
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <header className="w-full bg-transparent sticky top-0 z-40 px-3 sm:px-6 py-2.5 flex items-center justify-between text-white">
      {/* Brand (only displayed once inside a game room) */}
      <div className="flex items-center space-x-3">
        {isInRoom && (
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center font-bold text-white shadow">
              ♠
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base tracking-wider uppercase flex items-center gap-1.5">
                Kaali Raani
                <span className="text-[10px] bg-zinc-800 text-zinc-300 font-mono px-1.5 py-0.5 rounded border border-zinc-700 font-normal">
                  Black Queen
                </span>
              </h1>
            </div>
          </div>
        )}
      </div>

      {/* Center Room Code & Round */}
      {roomCode && (
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Room Code Badge */}
          <button
            onClick={copyRoomCode}
            className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 px-2.5 py-1 rounded-md text-xs sm:text-sm font-mono tracking-wider transition-all"
            title="Click to copy room code"
          >
            <span className="text-zinc-400 text-[11px]">ROOM:</span>
            <span className="font-bold text-white">{roomCode}</span>
            {copiedCode ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
          </button>

          {/* Round Indicator */}
          {currentRound > 0 && (
            <div className="hidden sm:flex items-center bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md text-xs font-mono">
              <span className="text-zinc-400 mr-1.5">ROUND</span>
              <span className="text-white font-bold">{currentRound}</span>
              <span className="text-zinc-500 mx-1">/</span>
              <span className="text-zinc-400">{totalRounds}</span>
            </div>
          )}
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {roomCode && (
          <button
            onClick={copyInviteLink}
            className="flex items-center space-x-1.5 bg-white text-black hover:bg-zinc-200 px-2.5 py-1 sm:py-1.5 rounded-md text-xs font-semibold transition-all shadow"
            title="Share room link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copied Link' : 'Invite'}</span>
          </button>
        )}

        {isInRoom && (
          <button
            onClick={onOpenLeaderboard}
            className="p-1.5 sm:p-2 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all"
            title="Leaderboard"
          >
            <Trophy className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onOpenRules}
          className="p-1.5 sm:p-2 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all"
          title="Game Rules"
        >
          <BookOpen className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
