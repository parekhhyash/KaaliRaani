'use client';

import React from 'react';
import { X, Award, Shield, HelpCircle, Layers } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded bg-white text-black font-bold flex items-center justify-center text-sm">
              ♠
            </div>
            <h2 className="text-lg font-bold tracking-wide">Kaali Raani (Black Queen) — Rulebook</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-5 space-y-6 text-sm text-zinc-300 leading-relaxed">
          {/* Section 1: Card Points */}
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-zinc-200" />
              1. Card Points (Total: 150 Points in Deck)
            </h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 font-mono">
                    <th className="p-3">Card</th>
                    <th className="p-3">Points Per Card</th>
                    <th className="p-3">Cards In Deck</th>
                    <th className="p-3">Total Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  <tr className="bg-white/5 font-semibold text-white">
                    <td className="p-3 flex items-center gap-1.5">
                      <span className="text-base">♠Q</span> Queen of Spades (Kaali Raani)
                    </td>
                    <td className="p-3">30 pts</td>
                    <td className="p-3">1</td>
                    <td className="p-3">30 pts</td>
                  </tr>
                  <tr>
                    <td className="p-3">Ace (Ekka) — ♠A, ♥A, ♦A, ♣A</td>
                    <td className="p-3">15 pts each</td>
                    <td className="p-3">4</td>
                    <td className="p-3">60 pts</td>
                  </tr>
                  <tr>
                    <td className="p-3">10 (Dus) — ♠10, ♥10, ♦10, ♣10</td>
                    <td className="p-3">10 pts each</td>
                    <td className="p-3">4</td>
                    <td className="p-3">40 pts</td>
                  </tr>
                  <tr>
                    <td className="p-3">5 (Paanch) — ♠5, ♥5, ♦5, ♣5</td>
                    <td className="p-3">5 pts each</td>
                    <td className="p-3">4</td>
                    <td className="p-3">20 pts</td>
                  </tr>
                  <tr className="text-zinc-500">
                    <td className="p-3">All other cards (K, Q, J, 9, 8, 7, 6, 4, 3, 2)</td>
                    <td className="p-3">0 pts</td>
                    <td className="p-3">39</td>
                    <td className="p-3">0 pts</td>
                  </tr>
                  <tr className="bg-zinc-900 font-bold text-white border-t border-zinc-700">
                    <td className="p-3" colSpan={3}>
                      Total Available Deck Points
                    </td>
                    <td className="p-3 text-white">150 pts</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Bidding */}
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-zinc-200" />
              2. Bidding Rules
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
              <li>
                Bidding starts at <strong className="text-white font-mono">70 points</strong>.
              </li>
              <li>
                Each new bid must increase the current highest bid by at least{' '}
                <strong className="text-white font-mono">5 points</strong> (e.g., 70, 75, 80, 85...).
              </li>
              <li>
                On your turn, you can either <strong className="text-white">Raise</strong> the bid or{' '}
                <strong className="text-white">Pass</strong>.
              </li>
              <li>
                <strong className="text-white">Once a player passes, they cannot bid again</strong> in that round.
              </li>
              <li>
                When all other 3 players have passed, the highest bidder wins the auction and becomes the{' '}
                <strong className="text-white">Declarer</strong>!
              </li>
            </ul>
          </div>

          {/* Section 3: Hidden Partner & Hukkum */}
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-zinc-200" />
              3. Choosing Hukkum (Trump) & Hidden Partner
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
              <li>
                The Declarer chooses the <strong className="text-white">Hukkum (Trump Suit)</strong>: ♠ Spades, ♥
                Hearts, ♦ Diamonds, or ♣ Clubs.
              </li>
              <li>
                The Declarer calls <strong className="text-white">any specific card</strong> in the deck (e.g. King of
                Hearts, Ace of Clubs) to identify their teammate.
              </li>
              <li>
                The player holding the called card becomes the Declarer&apos;s partner.
              </li>
              <li>
                <strong className="text-white">The partner remains HIDDEN</strong> until the called card is actually
                played in a trick! Opponents must observe plays and deduce who the partner is.
              </li>
            </ul>
          </div>

          {/* Section 4: Playing Tricks */}
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-zinc-200" />
              4. Playing the Game
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
              <li>The Declarer leads the first trick. 13 tricks are played in total.</li>
              <li>
                Players take turns clockwise playing 1 card. You{' '}
                <strong className="text-white">MUST follow the suit led</strong> if you hold a card of that suit.
              </li>
              <li>If you do not have any card of the lead suit, you may play any card, including a Trump card.</li>
              <li>
                <strong className="text-white">Trick Winner</strong>: The highest Trump card wins the trick. If no
                Trump is played, the highest card of the suit led wins (Rank hierarchy: A &gt; K &gt; Q &gt; J &gt; 10
                ... &gt; 2).
              </li>
              <li>The trick winner collects all card points from the 4 cards and leads the next trick.</li>
            </ul>
          </div>

          {/* Section 5: Scoring */}
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-zinc-200" />
              5. Round Scoring & Leaderboard Points
            </h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
              <p className="text-zinc-200">
                At the end of 13 tricks, the card points collected by the Declarer and their Partner are summed up:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-black/60 border border-zinc-800 rounded-lg">
                  <h4 className="font-bold text-white mb-1">If Declarer Team Reaches Bid Target:</h4>
                  <p className="text-xs text-zinc-300">
                    The bidding team wins! Declarer and Partner{' '}
                    <strong className="text-white">each receive points equal to the bid amount</strong>. Opposition
                    players receive <strong className="text-white">0 points</strong>.
                  </p>
                </div>
                <div className="p-3 bg-black/60 border border-zinc-800 rounded-lg">
                  <h4 className="font-bold text-white mb-1">If Declarer Team Fails Target:</h4>
                  <p className="text-xs text-zinc-300">
                    The opposition wins! Each opposition player{' '}
                    <strong className="text-white">receives points equal to the bid amount</strong>. Declarer and
                    Partner receive <strong className="text-white">0 points</strong>.
                  </p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 pt-2 border-t border-zinc-800">
                Points accumulate across all rounds selected by the host. The player with the highest total match score
                at the end is declared the Champion!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors text-sm"
          >
            Got it, Let&apos;s Play
          </button>
        </div>
      </div>
    </div>
  );
};
