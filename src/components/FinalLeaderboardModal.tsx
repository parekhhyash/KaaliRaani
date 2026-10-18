'use client';

import React, { useEffect } from 'react';
import { Player, RoundResult } from '@/types/game';
import { Trophy, Crown, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '@/lib/audio';

interface FinalLeaderboardModalProps {
  players: Player[];
  roundResults?: RoundResult[];
  totalRounds: number;
  isHost: boolean;
  onRestartGame: () => void;
}

export const FinalLeaderboardModal: React.FC<FinalLeaderboardModalProps> = ({
  players,
  totalRounds,
  isHost,
  onRestartGame,
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.matchScore - a.matchScore);
  const champion = sortedPlayers[0];

  useEffect(() => {
    sounds.playVictory();

    // Trigger celebratory confetti in monochrome and gold/silver
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ffffff', '#a1a1aa', '#52525b', '#000000'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ffffff', '#a1a1aa', '#52525b', '#000000'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 text-white">
      <div className="bg-zinc-950 border border-zinc-700 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Champion Ceremony Header */}
        <div className="p-8 text-center bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800">
          <div className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Crown className="w-10 h-10 fill-current" />
          </div>

          <div className="text-xs uppercase font-mono tracking-widest text-zinc-400 mb-1">
            Tournament Champion ({totalRounds} Rounds Match)
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{champion?.username}</h1>

          <div className="mt-2 inline-flex items-center space-x-2 bg-zinc-900 border border-zinc-700 px-4 py-1.5 rounded-full font-mono text-sm">
            <span className="text-zinc-400">Winning Score:</span>
            <span className="font-bold text-white text-base">{champion?.matchScore} Points</span>
          </div>
        </div>

        {/* Final Standings List */}
        <div className="overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-xs uppercase font-mono text-zinc-400 tracking-wider mb-3 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-white" />
              Final Tournament Standings
            </h3>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800/80 overflow-hidden">
              {sortedPlayers.map((player, idx) => (
                <div
                  key={player.id}
                  className={`p-4 flex items-center justify-between transition-all ${
                    idx === 0 ? 'bg-white/5' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs font-mono ${
                        idx === 0
                          ? 'bg-white text-black font-extrabold'
                          : idx === 1
                          ? 'bg-zinc-300 text-black'
                          : idx === 2
                          ? 'bg-zinc-600 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    <div>
                      <div className="font-bold text-white text-base flex items-center gap-2">
                        <span>{player.username}</span>
                        {idx === 0 && (
                          <span className="text-[10px] bg-white text-black font-extrabold px-1.5 py-0.5 rounded">
                            Winner
                          </span>
                        )}
                        {player.isHost && (
                          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1 rounded">Host</span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 font-mono">
                        Tricks Won: {player.tricksWon} • Match Score: {player.matchScore} pts
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xl font-extrabold text-white">{player.matchScore}</div>
                    <div className="text-[10px] text-zinc-500">Total Points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="text-xs font-mono text-zinc-400">Match Completed</div>

          {isHost ? (
            <button
              onClick={() => {
                sounds.playClick();
                onRestartGame();
              }}
              className="px-6 py-2.5 bg-white text-black hover:bg-zinc-200 font-extrabold text-sm rounded-xl transition-all flex items-center space-x-2 shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start New Match</span>
            </button>
          ) : (
            <div className="text-xs font-mono text-zinc-400">Waiting for host to start a new match...</div>
          )}
        </div>
      </div>
    </div>
  );
};
