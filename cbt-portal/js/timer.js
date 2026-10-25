/** Countdown based on the clock, so it stays accurate if the tab is throttled. */
export class Countdown {
  constructor(seconds, onTick, onEnd) {
    this.endAt = Date.now() + seconds * 1000;
    this.onTick = onTick;
    this.onEnd = onEnd;
    this.id = null;
  }

  get left() {
    return Math.max(Math.ceil((this.endAt - Date.now()) / 1000), 0);
  }

  start() {
    this.onTick(this.left);
    this.id = setInterval(() => {
      this.onTick(this.left);
      if (this.left <= 0) {
        this.stop();
        this.onEnd();
      }
    }, 500);
  }

  stop() {
    clearInterval(this.id);
    this.id = null;
  }
}
