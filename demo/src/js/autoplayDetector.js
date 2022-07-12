export class AutoplayController {
  constructor(player) {
    this.isChecked = false;
    this.player = player;
    this.autoplayAllowed = false;
    this.autoplayRequiresMuted = false;
  }

  getResult() {
    const { autoplayAllowed, autoplayRequiresMuted } = this;

    return { autoplayAllowed, autoplayRequiresMuted };
  }

  performCheck() {
    const mute = this.player.mute;
    const volume = this.player.volume;

    this.player.volume = 0.1;
    this.player.muted = false;
    const playPromise = this.player.media.play();

    if (playPromise !== undefined) {
      return playPromise
        .then(() => {
          this.autoplayAllowed = true;
          this.autoplayRequiresMuted = false;
          this.player.stop();
          this.player.volume = volume;
          this.player.muted = mute;
        })
        .catch(() => {
          return this.checkMutedAutoplaySupport();
        })
        .then(() => {
          return this.getResult();
        })
        .finally(() => {
          this.isChecked = true;
        });
    }

    return Promise.resolve(this.getResult());
  }

  checkMutedAutoplaySupport() {
    const mute = this.player.mute;
    const volume = this.player.volume;

    this.player.volume = 0;
    this.player.muted = true;

    const playPromise = this.player.media.play();

    if (playPromise !== undefined) {
      return playPromise
        .then(() => {
          this.autoplayAllowed = true;
          this.autoplayRequiresMuted = true;
          this.player.stop();
        })
        .catch(() => {
          this.player.volume = volume;
          this.player.muted = mute;
          this.autoplayAllowed = false;
          this.autoplayRequiresMuted = false;
        });
    }

    return Promise.resolve();
  }
}
