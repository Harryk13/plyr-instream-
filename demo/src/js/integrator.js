import Detachable from './detachableContainer';
import { createVmap } from './vmapTool';

const IS_DEV = window.location.href.indexOf('localhost:300') > -1;
const HOST = IS_DEV ? './dist/' : 'https://player.bidmatic.io/microplayer/';
const HLS_URL = 'https://cdn.jsdelivr.net/hls.js/latest/hls.min.js';
const PLAYER_FILE_NAME = `plyr.polyfilled${IS_DEV ? '' : '.min'}.js`;
let inited = false;

function createElement(opts) {
  const el = document.createElement(opts.tag || 'div');
  el.id = opts.id;
  el.className = opts.className;
  return el;
}

const defaultConfig = {
  debug: IS_DEV,
  controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume'],
  ads: {
    enabled: true,
    publisherId: '',
  },
};

function loadResource(url, type, container) {
  return new Promise((resolve, reject) => {
    const s = document.createElement(type);
    if (type === 'script') {
      s.async = true;
      s.src = url;
    } else {
      s.rel = 'stylesheet';
      s.href = url;
    }
    s.onload = resolve;
    s.onerror = reject;
    container.appendChild(s);
  });
}

function loadStyles(url) {
  return loadResource(url, 'link', document.head);
}

function loadScript(url) {
  return loadResource(url, 'script', document.body || document.head || document.documentElement);
}

function downloadConfig(playListId) {
  const playlistFileName = `${playListId}.playlist.json?cb=${Math.random()}`;
  const playListPath = `${HOST}/configs/`;

  return fetch(`${playListPath}${playlistFileName}`).then((data) => {
    return data.json();
  });
}

function loadPlayerSrc(element, playlistData) {
  const jsSources = [`${HOST}${PLAYER_FILE_NAME}?cb=${Math.random()}`];
  const config = { ...defaultConfig };
  // eslint-disable-next-line prefer-destructuring
  config.ads.response = createVmap(playlistData[0].ads);

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
      return new bidmaticPlyr(element, config);
    }
    const player = new bidmaticPlyr(element, config);
    player.source = playlistData[0];
    return player;
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
    const styleURL = `${HOST}integration.css?cb=${Math.random()}`;
    loadStyles(styleURL);
    loadPlayerSrc(videoTag, playlistData).then((playerInstance) => {
      detachable.player = playerInstance;
    });
  });
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
