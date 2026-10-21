'use client';

import React from 'react';
import { RoundResult, Player } from '@/types/game';
import { sounds } from '@/lib/audio';
import { Trophy, ArrowRight, Crown, Shield } from 'lucide-react';

interface RoundEndModalProps {
  roundResult: RoundResult;
  players: Player[];
  currentRound: number;
  totalRounds: number;
  isHost: boolean;
  onNextRound: () => void;
}

export const RoundEndModal: React.FC<RoundEndModalProps> = ({
  roundResult,
  players,
  currentRound,
  totalRounds,
  isHost,
  onNextRound,
}) => {
  const {
    roundNumber,
    declarerUsername,
    partnerUsername,
    calledCard,
    bidAmount,
    declarerTeamPoints,
    oppositionTeamPoints,
    biddingTeamWon,
    pointsAwarded,
    declarerTeamDelta: roundDeclarerDelta,
    oppositionTeamDelta: roundOppositionDelta,
  } = roundResult;

  const declarerDelta =
    roundDeclarerDelta !== undefined
      ? roundDeclarerDelta
      : biddingTeamWon
      ? pointsAwarded
      : -(bidAmount - declarerTeamPoints);

  const oppositionDelta =
    roundOppositionDelta !== undefined
      ? roundOppositionDelta
      : !biddingTeamWon
      ? pointsAwarded
      : -(Math.max(0, declarerTeamPoints - bidAmount));

  const sortedPlayers = [...players].sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 text-white">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Banner */}
        <div
          className={`p-5 text-center border-b ${
            biddingTeamWon
              ? 'bg-zinc-900 border-zinc-700'
              : 'bg-zinc-950 border-zinc-800'
          }`}
        >
          <div className="text-xs uppercase font-mono tracking-widest text-zinc-400 mb-1">
            Round {roundNumber} of {totalRounds} Complete
          </div>
          <h2 className="text-base sm:text-lg font-bold tracking-wider uppercase">
            {biddingTeamWon ? 'BIDDERS WIN' : 'DEFENDERS WIN'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Target was <strong className="text-white font-mono">{bidAmount} points</strong>. Declarer team scored{' '}
            <strong className="text-white font-mono">{declarerTeamPoints} points</strong>.
            {biddingTeamWon && declarerTeamPoints > bidAmount && (
              <span className="text-rose-400 ml-1">
                (Opposition failed to defend by {declarerTeamPoints - bidAmount} pts)
              </span>
            )}
            {!biddingTeamWon && (
              <span className="text-rose-400 ml-1">
                (Declarer team fell short by {bidAmount - declarerTeamPoints} pts)
              </span>
            )}
          </p>
        </div>

        {/* Content Details */}
        <div className="overflow-y-auto p-6 space-y-6 text-sm">
          {/* Teams Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Declarer Team Card */}
            <div
              className={`p-4 rounded-2xl border ${
                biddingTeamWon ? 'bg-zinc-900 border-white' : 'bg-zinc-950 border-zinc-800 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-mono font-bold text-zinc-400 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-white" /> Declarer Team
                </span>
                <span className="font-mono font-bold text-sm text-white">{declarerTeamPoints} pts</span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Declarer:</span>
                  <span className="font-bold text-white">{declarerUsername}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Partner:</span>
                  <span className="font-bold text-white">
                    {partnerUsername}{' '}
                    <span className="text-[10px] text-zinc-500 font-normal">
                      (held {calledCard.rank} of {calledCard.suit})
                    </span>
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-zinc-800 font-mono text-xs flex justify-between">
                <span className="text-zinc-400">Match Points:</span>
                <strong
                  className={
                    declarerDelta > 0
                      ? 'text-white'
                      : declarerDelta < 0
                      ? 'text-rose-400'
                      : 'text-zinc-400'
                  }
                >
                  {declarerDelta > 0
                    ? `+${declarerDelta} pts each`
                    : declarerDelta < 0
                    ? `${declarerDelta} pts each (subtracted)`
                    : '0 pts'}
                </strong>
              </div>
            </div>

            {/* Opposition Team Card */}
            <div
              className={`p-4 rounded-2xl border ${
                !biddingTeamWon ? 'bg-zinc-900 border-white' : 'bg-zinc-950 border-zinc-800 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-mono font-bold text-zinc-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-white" /> Opposition Team
                </span>
                <span className="font-mono font-bold text-sm text-white">{oppositionTeamPoints} pts</span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="text-zinc-400">Defending Players:</div>
                <div className="font-bold text-white">
                  {players
                    .filter((p) => p.username !== declarerUsername && p.username !== partnerUsername)
                    .map((p) => p.username)
                    .join(' & ') || 'Other Players'}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-zinc-800 font-mono text-xs flex justify-between">
                <span className="text-zinc-400">Match Points:</span>
                <strong
                  className={
                    oppositionDelta > 0
                      ? 'text-white'
                      : oppositionDelta < 0
                      ? 'text-rose-400'
                      : 'text-zinc-400'
                  }
                >
                  {oppositionDelta > 0
                    ? `+${oppositionDelta} pts each`
                    : oppositionDelta < 0
                    ? `${oppositionDelta} pts each (subtracted)`
                    : '0 pts'}
                </strong>
              </div>
            </div>
          </div>

          {/* Current Cumulative Leaderboard */}
          <div>
            <div className="flex items-center space-x-2 text-xs uppercase font-mono text-zinc-400 mb-2">
              <Trophy className="w-3.5 h-3.5 text-white" />
              <span>Cumulative Match Standings</span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800 font-mono text-xs">
              {sortedPlayers.map((p, idx) => (
                <div key={p.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-zinc-500 font-bold">{idx + 1}.</span>
                    <span className="font-bold text-white">{p.username}</span>
                  </div>
                  <div className="font-bold text-white text-sm">{p.matchScore} pts</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="text-xs text-zinc-400 font-mono">
            {currentRound < totalRounds ? `Next: Round ${currentRound + 1} of ${totalRounds}` : 'Final Round Complete'}
          </div>

          {isHost ? (
            <button
              onClick={() => {
                sounds.playClick();
                onNextRound();
              }}
              className="px-6 py-2.5 bg-white text-black hover:bg-zinc-200 font-extrabold text-sm rounded-xl transition-all flex items-center space-x-2 shadow-lg"
            >
              <span>Start Round {currentRound + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-xs font-mono text-zinc-400 animate-pulse">
              Waiting for host to start next round...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
