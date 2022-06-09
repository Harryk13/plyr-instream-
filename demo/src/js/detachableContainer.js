const DETACH_STATES = {
  init: 0,
  ready: 1,
  detached: 2,
  closed: 3,
};

class Detachable {
  constructor(element) {
    let container = element;
    if (typeof element === 'string') {
      container = document.querySelector(element);
    }
    if (container == null) {
      throw new Error('unknown element', element);
    }
    this.container = container;
    this.currentState = DETACH_STATES.init;
    this.containerPrevStyles = {};
    this.injectCloseButton();
    this.initObserver();
  }

  initObserver() {
    const defaultObserverOptions = {
      root: document.querySelector('#scrollArea'),
      rootMargin: '0px',
      threshold: [0, 0.1, 0.5, 0.9, 1],
    };

    this.intersectionObserver = new IntersectionObserver(this.intersectionCallback.bind(this), defaultObserverOptions);
    this.intersectionObserver.observe(this.container.parentNode);
  }

  injectCloseButton() {
    this.closeBtn = document.createElement('div');
    this.closeBtn.className = 'close';
    this.container.appendChild(this.closeBtn);
    this.closeBtn.addEventListener('click', this.close.bind(this));
    this.closeBtn.addEventListener('ontouchend', this.close.bind(this));
  }

  close() {
    this.becomeVisible();
    this.currentState = DETACH_STATES.closed;
    this.intersectionObserver.unobserve(this.container.parentNode);
  }

  intersectionCallback(entries) {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0.5) {
        this.becomeVisible();
      } else {
        this.becomeInvisible();
      }
    });
  }

  onContainerVisible() {
  }

  becomeVisible() {
    if (this.currentState === DETACH_STATES.ready) {
      return;
    }
    this.onContainerVisible();
    this.restoreContainerSize();
    this.currentState = DETACH_STATES.ready;
    this.container.className = this.container.className.replace(' detached', '');
  }

  becomeInvisible() {
    if (this.currentState === DETACH_STATES.ready) {
      this.holdContainerSize();
      this.container.className += ' detached';
      this.currentState = DETACH_STATES.detached;
    }
  }

  holdContainerSize() {
    const { parentNode } = this.container;
    const { width, height } = parentNode.style;
    this.containerPrevStyles = { width, height };

    const actualSize = window.getComputedStyle(parentNode);
    parentNode.style.width = actualSize.width;
    parentNode.style.height = actualSize.height;
  }

  restoreContainerSize() {
    const { parentNode } = this.container;
    parentNode.style.width = this.containerPrevStyles.width;
    parentNode.style.height = this.containerPrevStyles.height;
  }
}

export default Detachable;
