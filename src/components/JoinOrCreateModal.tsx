'use client';

import React, { useState, useEffect } from 'react';
import { Crown, Users, ArrowRight, RotateCcw, BookOpen, ImageIcon, Eye, EyeOff } from 'lucide-react';
import { sounds } from '@/lib/audio';

export const BACKGROUND_OPTIONS = [
  { id: 'bg-1', name: 'Option 1: Vintage Card', shortName: 'Vintage', path: '/bg-1.jpg' },
  { id: 'bg-2', name: 'Option 2: Textured Border', shortName: 'Textured', path: '/bg-2.png' },
  { id: 'bg-3', name: 'Option 3: Smoke & Mist Aura', shortName: 'Smoke Aura', path: '/bg-3.png' },
];

interface JoinOrCreateModalProps {
  initialRoomCode?: string;
  hasPreviousSession?: boolean;
  previousRoomCode?: string;
  previousUsername?: string;
  onCreateRoom: (username: string, totalRounds: number) => void;
  onJoinRoom: (roomCode: string, username: string) => void;
  onResumeSession: () => void;
  onOpenRules: () => void;
  currentBg?: string;
  onSelectBg?: (bg: string) => void;
}

export const JoinOrCreateModal: React.FC<JoinOrCreateModalProps> = ({
  initialRoomCode = '',
  hasPreviousSession = false,
  previousRoomCode = '',
  previousUsername = '',
  onCreateRoom,
  onJoinRoom,
  onResumeSession,
  onOpenRules,
  currentBg = '/bg-1.jpg',
  onSelectBg,
}) => {
  const [isPeekingBg, setIsPeekingBg] = useState(false);
  const [mode, setMode] = useState<'join' | 'create'>(initialRoomCode ? 'join' : 'create');
  const [username, setUsername] = useState(previousUsername || '');
  const [roomCode, setRoomCode] = useState(initialRoomCode || '');
  const [totalRounds, setTotalRounds] = useState(3);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode.toUpperCase());
      setMode('join');
    }
  }, [initialRoomCode]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    setError('');
    sounds.playClick();
    onCreateRoom(username.trim(), totalRounds);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    if (!roomCode.trim()) {
      setError('Please enter a 6-character room code');
      return;
    }
    setError('');
    sounds.playClick();
    onJoinRoom(roomCode.trim().toUpperCase(), username.trim());
  };

  return (
    <div className={`w-full max-w-lg mx-auto lg:mx-0 p-4 sm:p-6 text-white transition-opacity duration-300 ${isPeekingBg ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>
      {/* Branding Hero */}
      <div className="text-center mb-8 relative z-10">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-md">Kaali Raani</h1>
        <p className="text-xs uppercase font-mono tracking-widest text-zinc-400 mt-1">
          Black Queen • 150 Point Indian Card Game
        </p>
      </div>

      {/* Reconnect Banner if previous session exists */}
      {hasPreviousSession && previousRoomCode && (
        <div className="mb-6 p-4 rounded-2xl bg-zinc-900/90 backdrop-blur-md border border-white/20 flex items-center justify-between shadow-xl relative z-10">
          <div>
            <div className="text-xs font-mono text-zinc-400 uppercase">Active Session Detected</div>
            <div className="font-bold text-white text-sm">
              Room: {previousRoomCode} ({previousUsername})
            </div>
          </div>
          <button
            onClick={onResumeSession}
            className="px-4 py-2 bg-white text-black hover:bg-zinc-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Rejoin Game</span>
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-zinc-950/85 backdrop-blur-xl border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Toggle Mode */}
        <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('create');
              setError('');
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              mode === 'create'
                ? 'bg-white text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Create Room</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('join');
              setError('');
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              mode === 'join'
                ? 'bg-white text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Join Room</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {mode === 'create' ? (
          /* CREATE ROOM FORM */
          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Your Username
              </label>
              <input
                type="text"
                placeholder="e.g. Yash"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={16}
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 font-semibold focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-zinc-400 mb-2">
                Number of Rounds: <span className="text-white font-mono font-bold">{totalRounds}</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 3, 5, 10].map((rounds) => (
                  <button
                    key={rounds}
                    type="button"
                    onClick={() => setTotalRounds(rounds)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                      totalRounds === rounds
                        ? 'bg-white text-black border-white'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {rounds} {rounds === 1 ? 'Round' : 'Rounds'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-white text-black hover:bg-zinc-200 font-black text-sm rounded-xl transition-all shadow-xl flex items-center justify-center space-x-2 mt-4 hover:scale-[1.01]"
            >
              <span>Create Room</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* JOIN ROOM FORM */
          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Room Code
              </label>
              <input
                type="text"
                placeholder="e.g. KQ8912"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={8}
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white font-mono text-center tracking-widest text-lg font-bold placeholder-zinc-500 uppercase focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-zinc-400 mb-1.5">
                Your Username
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={16}
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 font-semibold focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-white text-black hover:bg-zinc-200 font-black text-sm rounded-xl transition-all shadow-xl flex items-center justify-center space-x-2 mt-4 hover:scale-[1.01]"
            >
              <span>Join Game Room</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenRules}
            className="text-xs text-zinc-400 hover:text-white flex items-center space-x-1.5 transition-colors font-mono"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Read Kaali Raani Rules</span>
          </button>
        </div>
      </div>

      {/* Background Switcher for Previewing & Choosing */}
      {onSelectBg && (
        <div className="mt-6 flex flex-col items-center gap-2.5 relative z-20">
          <div className="flex items-center justify-between w-full px-1">
            <span className="text-[11px] uppercase tracking-wider font-mono text-zinc-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-white" />
              <span>Background Theme:</span>
            </span>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsPeekingBg(!isPeekingBg);
              }}
              className={`flex items-center space-x-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                isPeekingBg
                  ? 'bg-white text-black border-white font-bold shadow'
                  : 'bg-zinc-900/90 text-zinc-300 hover:text-white border-zinc-700 hover:bg-zinc-800'
              }`}
              title={isPeekingBg ? 'Restore full form view' : 'Dim form to view background art'}
            >
              {isPeekingBg ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{isPeekingBg ? 'Show Form' : 'Peek Art'}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full">
            {BACKGROUND_OPTIONS.map((bg, idx) => {
              const isSelected = currentBg === bg.path;
              return (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onSelectBg(bg.path);
                  }}
                  className={`py-2 px-2 rounded-xl border text-xs font-mono font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                    isSelected
                      ? 'bg-white text-black border-white shadow-xl scale-[1.02]'
                      : 'bg-zinc-950/80 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white backdrop-blur-md'
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-wider opacity-70">Image {idx + 1}</span>
                  <span className="truncate max-w-full text-center text-[11px]">
                    {bg.shortName}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] font-mono text-zinc-500 text-center">
            Click to compare all 3 backgrounds live. Tell me which one you like best to keep!
          </p>
        </div>
      )}
    </div>
  );
};
