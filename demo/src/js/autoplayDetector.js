export class AutoplayController {
  constructor(player) {
    this.player = player;
    this.autoplayAllowed = false;
    this.autoplayRequiresMuted = false;
  }

  checkAutoplaySupport() {
    const playPromise = this.player.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.player.pause();
          this.autoplayAllowed = true;
          this.autoplayRequiresMuted = false;
        })
        .catch(() => {
          return this.checkMutedAutoplaySupport();
        })
        .then(() => {
          const { autoplayAllowed, autoplayRequiresMuted } = this;
          return { autoplayAllowed, autoplayRequiresMuted };
        });
    }
  }

  checkMutedAutoplaySupport() {
    this.player.volume = 0;
    this.player.muted = true;
    const playPromise = this.player.play();
    if (playPromise !== undefined) {
      return playPromise
        .then(() => {
          this.player.pause();
          this.autoplayAllowed = true;
          this.autoplayRequiresMuted = true;
        })
        .catch(() => {
          this.autoplayAllowed = false;
          this.autoplayRequiresMuted = false;
        }).then(() => {
          // restore values at the end
          this.player.volume = 1;
          this.player.muted = false;
        });
    }
    return Promise.resolve();
  }
}
