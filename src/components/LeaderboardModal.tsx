'use client';

import React from 'react';
import { X, Trophy } from 'lucide-react';
import { Player, RoundResult } from '@/types/game';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  roundResults: RoundResult[];
  currentRound: number;
  totalRounds: number;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  players,
  roundResults,
  currentRound,
  totalRounds,
}) => {
  if (!isOpen) return null;

  // Sort players by cumulative matchScore descending
  const sortedPlayers = [...players].sort((a, b) => b.matchScore - a.matchScore);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 0:
        return (
          <div className="w-6 h-6 rounded-full bg-white text-black font-extrabold flex items-center justify-center text-xs shadow">
            1
          </div>
        );
      case 1:
        return (
          <div className="w-6 h-6 rounded-full bg-zinc-300 text-black font-extrabold flex items-center justify-center text-xs">
            2
          </div>
        );
      case 2:
        return (
          <div className="w-6 h-6 rounded-full bg-zinc-600 text-white font-extrabold flex items-center justify-center text-xs">
            3
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 font-mono flex items-center justify-center text-xs">
            {rank + 1}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-white" />
            <h2 className="text-base sm:text-lg font-bold tracking-wide">
              Match Standings (Round {Math.max(1, currentRound)} of {totalRounds})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-5 space-y-6 text-sm">
          {/* Cumulative Scoreboard */}
          <div>
            <h3 className="text-xs uppercase font-mono text-zinc-400 tracking-wider mb-2.5">Overall Leaderboard</h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800/80">
              {sortedPlayers.map((player, idx) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3.5 ${
                    idx === 0 ? 'bg-white/5' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getRankBadge(idx)}
                    <div>
                      <div className="flex items-center space-x-1.5 font-bold text-white">
                        <span>{player.username}</span>
                        {player.isHost && (
                          <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded border border-zinc-700">
                            Host
                          </span>
                        )}
                        {player.isBot && (
                          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1 rounded">
                            Bot
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400">
                        Round points: {player.cardPointsCollected} pts • Tricks: {player.tricksWon}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-mono font-extrabold text-white">
                      {player.matchScore}{' '}
                      <span className="text-xs font-normal text-zinc-400">pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Round-by-Round History */}
          {roundResults.length > 0 && (
            <div>
              <h3 className="text-xs uppercase font-mono text-zinc-400 tracking-wider mb-2.5">
                Completed Rounds History
              </h3>
              <div className="space-y-2">
                {roundResults.map((res) => (
                  <div
                    key={res.roundNumber}
                    className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>Round {res.roundNumber}:</span>
                        <span className={res.biddingTeamWon ? 'text-white underline' : 'text-zinc-400'}>
                          {res.biddingTeamWon ? 'Bid Made' : 'Bid Failed'}
                        </span>
                      </div>
                      <div className="text-zinc-400 mt-0.5">
                        Declarer: <strong className="text-zinc-200">{res.declarerUsername}</strong> (Bid: {res.bidAmount}) • Partner:{' '}
                        <strong className="text-zinc-200">{res.partnerUsername}</strong>
                      </div>
                      <div className="text-zinc-400">
                        Score: Declarer Team {res.declarerTeamPoints} pts vs Opposition {res.oppositionTeamPoints} pts
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-white font-bold text-sm">+{res.pointsAwarded} pts</div>
                      <div className="text-[10px] text-zinc-500">
                        to {res.biddingTeamWon ? 'Declarer Team' : 'Opposition'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
