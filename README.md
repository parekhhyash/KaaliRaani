# ♠ Kaali Raani (Black Queen) — Multiplayer Card Game

[![Deploy with Vercel](https://vercel.com/button)](https://blackqueen.vercel.app)
**🎮 Live Game URL**: [https://blackqueen.vercel.app](https://blackqueen.vercel.app)

A real-time multiplayer implementation of the classic Indian trick-taking card game **Kaali Raani** (Black Queen). Built with **Next.js**, **TypeScript**, and **Tailwind CSS**, featuring a minimalist **Black & White aesthetic** and **WebRTC Peer-to-Peer** networking for seamless serverless hosting on **Vercel** with zero external backend required.

---

## 🌟 Key Features

- **♠ Pure Black & White UI**: Immersive, high-contrast dark theme with jet-black background (`#000000`), crisp white typography, and sleek card renderings.
- **🌐 Zero-Backend Vercel Hosting**: Built on browser-to-browser WebRTC data channels via PeerJS. Host and players communicate with near-zero latency without requiring a separate backend or database server.
- **🔄 Session Resilience & Reconnection**: Even if a player refreshes their browser or briefly disconnects, their game session is preserved in `localStorage`. Joining again with the same username instantly resumes their seat, hand, and score.
- **🤖 Built-in AI Bots**: Host can instantly fill empty seats with smart AI bots for solo practice or when waiting for friends.
- **🏆 Multi-Round Leaderboard & Tournament**: Host chooses the number of rounds (1, 3, 5, 7, 10). Live standings track cumulative scores across rounds, culminating in a Grand Champion ceremony with confetti!
- **🎵 Synthesized Web Audio**: Tactile sound effects generated purely using the browser's Web Audio API (no external MP3 files required). Includes mute toggle.
- **📱 Instant Sharing**: One-click room code and invite link copying (`/?room=CODE`) with native Web Share API support.

---

## 📜 Kaali Raani — Official Rules

### 1. Card Point Values (150 Total Points in Deck)

In Kaali Raani, not all cards have points. Only specific cards carry point value:

| Card | Points Per Card | Quantity | Total Points |
| :--- | :--- | :--- | :--- |
| **Queen of Spades (♠Q) — Kaali Raani** | **30 pts** | 1 | **30 pts** |
| **Ace (Ekka)** — ♠A, ♥A, ♦A, ♣A | **15 pts each** | 4 | **60 pts** |
| **10 (Dus)** — ♠10, ♥10, ♦10, ♣10 | **10 pts each** | 4 | **40 pts** |
| **5 (Paanch)** — ♠5, ♥5, ♦5, ♣5 | **5 pts each** | 4 | **20 pts** |
| **All other cards** (K, Q, J, 9, 8, 7, 6, 4, 3, 2) | **0 pts** | 39 | **0 pts** |
| **Total Available in Deck** | | | **150 pts** |

---

### 2. Bidding Phase

1. Each player is dealt **13 cards** from a standard 52-card deck.
2. Bidding begins at **70 points**.
3. Players take turns raising the current bid by at least **5 points** (e.g. 70, 75, 80, 85... up to 150).
4. A player can either **Raise** or **Pass**.
5. **Once a player passes, they cannot bid again in that round.**
6. The highest bidder wins the auction and becomes the **Declarer**.

---

### 3. Choosing Hukum (Trump) & Hidden Partner

After winning the auction, the Declarer:
1. Selects the **Hukum (Trump Suit)**: Spades (♠), Hearts (♥), Diamonds (♦), or Clubs (♣).
2. Calls **any specific card** in the deck (e.g. King of Hearts, Ace of Diamonds, 7 of Spades).
3. The player holding that called card becomes the Declarer's **Secret Partner**!
4. **The partner remains HIDDEN** until the called card is played in a trick. Until then, opponents must deduce the partner's identity from gameplay.

---

### 4. Playing Tricks

1. Declarer leads the first of 13 tricks.
2. **Follow Suit Rule**: Players **must** follow the lead suit if they hold any card of that suit.
3. If a player does not have any cards of the lead suit, they may play **any card**, including a Trump card.
4. **Trick Evaluation**:
   - The highest Trump card played wins the trick.
   - If no Trump was played, the highest card of the lead suit wins (A > K > Q > J > 10 > ... > 2).
5. The winner collects the 4 cards and all points contained within them, then leads the next trick.

---

### 5. Scoring & Match Leaderboard

At the end of 13 tricks, card points collected by the Declarer and Partner are totaled:
- **If Declarer Team ≥ Bid Amount**:
  - The bidding team wins! Declarer and Partner **each receive match points equal to the bid amount**.
  - Opposition players receive **0 points**.
- **If Declarer Team < Bid Amount**:
  - The opposition wins! Each opposition player **receives match points equal to the bidder's bid amount**.
  - Declarer and Partner receive **0 points**.

Scores accumulate over the chosen number of rounds. The player with the highest total match score wins the championship!

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in your browser
http://localhost:3000
```

---

## ☁️ Deploying to Vercel

Since all multiplayer state synchronization is handled via WebRTC Data Channels and client-side authoritative state machines:

1. Push this repository to GitHub:
   ```bash
   git push origin main
   ```
2. Import the repository in [Vercel](https://vercel.com).
3. Click **Deploy**. No additional environment variables, databases, or Redis setups are required!

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Pure Black `#000000` & White)
- **Networking**: PeerJS (WebRTC DataChannels)
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti
- **Audio**: Web Audio API Sound Synthesizer
