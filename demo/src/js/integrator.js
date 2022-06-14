import Detachable from './detachableContainer';

const HOST = window.location.href.indexOf('localhost:3000') > -1 ? './dist/' : 'https://player.adtcdn.com/microplayer/';
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

function downloadConfig(playListId) {
  const playlistFileName = `${playListId}.playlist.json`;
  const playListPath = `${HOST}/configs/`;

  return fetch(`${playListPath}${playlistFileName}`).then((data) => {
    return data.json();
  });
}

function loadPlayerSrc(element, playlistData) {
  const jsSources = [`${HOST}plyr.polyfilled.min.js`];
  const config = { ...defaultConfig };
  // eslint-disable-next-line prefer-destructuring
  config.ads.tagUrl = playlistData[0].ads[0];

  if (playlistData[0].sources[0].type === 'application/x-mpegURL') {
    config.useHLS = true;
    jsSources.push(HLS_URL);
  }
  return Promise.all(jsSources.map(loadScript)).then(() => {
    if (config.useHLS) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(playlistData[0].sources[0].src);
        hls.attachMedia(element);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          element.play();
        });
      }
      new bidmaticPlyr(element, config);
    } else {
      const player = new bidmaticPlyr(element, config);
      player.source = playlistData[0];
    }
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
  const detachable = new Detachable(`#${detachId}`);
  downloadConfig(container.getAttribute('data-detachable-player')).then((playlistData) => {
    loadPlayerSrc(videoTag, playlistData);
  });

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
