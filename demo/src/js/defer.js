export default class Defer {
  constructor() {
    let resolve;
    let reject;

    const promise = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    this._resolve = resolve;
    this._reject = reject;
    this.then = promise.then.bind(promise);
    this.catch = promise.catch.bind(promise);
  }

  resolve(...args) {
    this._resolve(...args);
  }

  reject(...args) {
    this._reject(...args);
  }
}
