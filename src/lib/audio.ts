/**
 * Sound effects disabled.
 */

class SoundEffects {
  public isMuted: boolean = true;

  public playCardPlay() {}
  public playBid() {}
  public playPass() {}
  public playTrickWin() {}
  public playPartnerReveal() {}
  public playVictory() {}
  public playTrump() {}
  public playTrumpReveal() {}
  public playClick() {}
}

export const sounds = new SoundEffects();
