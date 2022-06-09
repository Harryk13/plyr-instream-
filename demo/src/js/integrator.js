import Plyr from '../../../src/js/plyr';
import Detachable from './detachableContainer';

let inited = false;

function createElement(opts) {
  const el = document.createElement(opts.tag || 'div');
  el.id = opts.id;
  el.className = opts.className;
  return el;
}

const defaultConfig = {
  debug: true,
  controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume'],
  ads: {
    enabled: true,
    publisherId: '',
  },
};
const HLS_URL = 'https://cdn.jsdelivr.net/hls.js/latest/hls.min.js';

function initPlayer(element) {
  fetch('./src/js/playlist.json')
    .then((data) => {
      return data.json();
    })
    .then((playlist) => {
      const config = { ...defaultConfig };
      config.ads.tagUrl = playlist[0].ads[0];

      if (playlist[0].sources[0].type === 'application/x-mpegURL') {
        loadScript(HLS_URL).then(() => {
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(playlist[0].sources[0].src);
            hls.attachMedia(element);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              element.play();
            });
          }
          new Plyr(element, config);
        });
      } else {
        const player = new Plyr(element, config);
        player.source = playlist[0];
        window.player = player;
      }
    });
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.async = true;
    s.src = url;
    s.onload = resolve;
    s.onerror = reject;
    (document.body || document.head || document.documentElement).appendChild(s);
  });
}

function initDom(container) {
  if (container == null) return;
  const prefix = 'bidmatic-';
  const containerId = `${prefix}playerContainer`;
  const detachId = `${prefix}detachable`;
  const playerId = `${prefix}player`;
  const mainContainer = createElement({ id: containerId });
  const detachableContainer = createElement({ id: detachId, className: detachId });
  const videoTag = createElement({
    id: playerId,
    tag: 'video',
    attributes: {
      controls: true,
      crossorigin: true,
      playsinline: true,
    },
  });
  container.appendChild(mainContainer);
  mainContainer.appendChild(detachableContainer);
  detachableContainer.appendChild(videoTag);
  initPlayer(videoTag);
  const detachable = new Detachable(`#${detachId}`);
  detachable.onContainerVisible = () => {
    // player.play();
  };
}

function placeholderLookupAndInit() {
  if (inited) return;
  const element = document.querySelector('[data-detachable-player]');
  if (element == null) {
    return;
  }
  inited = true;
  initDom(element);
}

// entry point
placeholderLookupAndInit();
document.addEventListener('DOMContentLoaded', placeholderLookupAndInit);
