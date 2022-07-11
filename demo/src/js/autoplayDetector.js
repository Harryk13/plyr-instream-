export class AutoplayController {
  constructor(videoTag) {
    this.player = videoTag;
    this.autoplayAllowed = false;
    this.autoplayRequiresMuted = false;
  }

  getResult() {
    const { autoplayAllowed, autoplayRequiresMuted } = this;
    return { autoplayAllowed, autoplayRequiresMuted };
  }

  performCheck() {
    const playPromise = this.player.play();
    if (playPromise !== undefined) {
      return playPromise
        .then(() => {
          this.autoplayAllowed = true;
          this.autoplayRequiresMuted = false;
        })
        .catch(() => {
          return this.checkMutedAutoplaySupport();
        })
        .then(() => {
          return this.getResult();
        });
    }
    return Promise.resolve(this.getResult());
  }

  checkMutedAutoplaySupport() {
    this.player.volume = 0;
    this.player.muted = true;
    const playPromise = this.player.play();
    if (playPromise !== undefined) {
      return playPromise
        .then(() => {
          this.autoplayAllowed = true;
          this.autoplayRequiresMuted = true;
        })
        .catch(() => {
          this.autoplayAllowed = false;
          this.autoplayRequiresMuted = false;
        })
        .then(() => {
          // restore values at the end
          this.player.volume = 1;
          this.player.muted = false;
        });
    }
    return Promise.resolve();
  }
}
