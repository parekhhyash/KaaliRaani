'use client';

import React, { useState } from 'react';
import { Player, GameSettings } from '@/types/game';
import { Copy, Check, Share2, Plus, Trash2, Play, Users, Bot, Crown } from 'lucide-react';
import { sounds } from '@/lib/audio';

interface GameLobbyProps {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  settings: GameSettings;
  onStartGame: () => void;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
}

export const GameLobby: React.FC<GameLobbyProps> = ({
  roomCode,
  players,
  isHost,
  settings,
  onStartGame,
  onAddBot,
  onRemoveBot,
  onUpdateSettings,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    sounds.playClick();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyInviteLink = () => {
    if (typeof window === 'undefined') return;
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
      sounds.playClick();
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const totalPlayers = players.length;
  const maxPlayers = 6;
  const emptySlots = Math.max(0, maxPlayers - totalPlayers);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center text-white">
      {/* Lobby Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-mono mb-3">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Game Room Waiting Lobby</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Kaali Raani</h1>
        <p className="text-sm text-zinc-400 mt-1 max-w-md mx-auto">
          The 150-point classic Indian trick-taking card game. 2 to 6 players, 1 declarer, and 1 secret partner.
        </p>
      </div>

      {/* Room Code & Share Card */}
      <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 mb-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-mono text-zinc-400">Room Code</div>
          <div className="flex items-center space-x-3 mt-1">
            <span className="text-3xl font-black font-mono tracking-widest text-white">{roomCode}</span>
            <button
              onClick={copyRoomCode}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
              title="Copy room code"
            >
              {copiedCode ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={copyInviteLink}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-white text-black hover:bg-zinc-200 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Invite Link'}</span>
          </button>
        </div>
      </div>

      {/* Host Settings */}
      <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 mb-6 shadow-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-zinc-300 mb-4 flex items-center gap-2">
          <Crown className="w-4 h-4 text-white" />
          Game Settings {isHost ? '(Host Only)' : '(Set by Host)'}
        </h2>

        <div>
          {/* Number of Rounds */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Number of Rounds: <span className="text-white font-mono font-bold">{settings.totalRounds}</span>
            </label>
            {isHost ? (
              <div className="flex items-center space-x-2">
                {[1, 3, 5, 7, 10].map((rounds) => (
                  <button
                    key={rounds}
                    onClick={() => {
                      sounds.playClick();
                      onUpdateSettings({ totalRounds: rounds });
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                      settings.totalRounds === rounds
                        ? 'bg-white text-black border-white shadow'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    {rounds} {rounds === 1 ? 'Round' : 'Rounds'}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 font-mono">
                {settings.totalRounds} Rounds Match
              </div>
            )}
          </div>
        </div>

        {/* Distribution Details Note */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] font-mono text-zinc-400 flex flex-wrap items-center justify-between gap-2">
          <span>• 150 Points Total (♠Q=30, A=15, 10=10, 5=5)</span>
          <span className="text-zinc-500">
            {totalPlayers >= 4
              ? `${totalPlayers} Players (${totalPlayers === 6 ? '8' : totalPlayers === 5 ? '10' : '13'} cards each)`
              : 'Minimum 4 players required (join with code or add bots)'}
          </span>
        </div>
      </div>

      {/* Players List (4 to 6 Seats) */}
      <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 mb-8 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-white" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-zinc-300">
              Players ({totalPlayers} / 6)
            </h3>
          </div>

          {isHost && totalPlayers < maxPlayers && (
            <button
              onClick={() => {
                sounds.playClick();
                onAddBot();
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add AI Bot</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {players.map((p, idx) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-black border border-zinc-700 flex items-center justify-center font-bold text-white text-sm">
                  {p.isBot ? <Bot className="w-4 h-4 text-zinc-400" /> : idx + 1}
                </div>
                <div>
                  <div className="flex items-center space-x-1.5 font-bold text-white text-sm">
                    <span>{p.username}</span>
                    {p.isHost && (
                      <span className="text-[10px] bg-white text-black font-semibold px-1.5 py-0.5 rounded">
                        Host
                      </span>
                    )}
                    {p.isBot && (
                      <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">
                        AI
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono">Seat {idx + 1}</div>
                </div>
              </div>

              {isHost && p.isBot && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onRemoveBot(p.id);
                  }}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                  title="Remove Bot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {/* Empty Seats */}
          {Array.from({ length: emptySlots }).map((_, i) => {
            const seatNumber = totalPlayers + i + 1;
            const isRequired = seatNumber <= 4;
            return (
              <div
                key={`empty-${i}`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/60 border border-dashed border-zinc-800 text-zinc-600"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg border border-dashed border-zinc-800 flex items-center justify-center text-xs font-mono">
                    {seatNumber}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-500">
                      {isRequired ? 'Seat Required (Player or Bot)' : 'Optional Seat'}
                    </div>
                    <div className="text-[11px] text-zinc-600 font-mono">
                      {isRequired ? 'Min 4 players needed to play' : 'Max 6 players'}
                    </div>
                  </div>
                </div>

                {isHost && (
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onAddBot();
                    }}
                    className="text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
                  >
                    + Add Bot
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Start Button Area */}
      <div className="w-full flex flex-col items-center">
        {isHost ? (
          <div className="w-full max-w-md flex flex-col items-center gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                onStartGame();
              }}
              className="w-full py-4 bg-white text-black hover:bg-zinc-200 font-extrabold text-base rounded-xl transition-all shadow-2xl flex items-center justify-center space-x-2 hover:scale-[1.01]"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>
                {totalPlayers >= 4
                  ? `Start Match (${totalPlayers} Players)`
                  : `Start Match (Auto-fills ${4 - totalPlayers} Bot${4 - totalPlayers > 1 ? 's' : ''} to 4)`}
              </span>
            </button>
          </div>
        ) : (
          <div className="text-center p-4 bg-zinc-950 border border-zinc-800 rounded-xl max-w-md w-full">
            <div className="inline-block animate-spin mr-2">♠</div>
            <span className="text-sm text-zinc-400">Waiting for host to start the game...</span>
          </div>
        )}
      </div>
    </div>
  );
};
