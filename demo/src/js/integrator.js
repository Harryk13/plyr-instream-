/* global Hls, bidmaticPlyr */
import { AutoplayController } from './autoplayDetector';
import Detachable from './detachableContainer';
import { createVmap } from './vmapTool';

const IS_DEV = window.location.href.indexOf('localhost:300') > -1;
const HOST = IS_DEV ? './dist/' : 'https://player.bidmatic.io/microplayer/';
const HLS_URL = 'https://cdn.jsdelivr.net/hls.js/latest/hls.min.js';
const PLAYER_FILE_NAME = `plyr.polyfilled${IS_DEV ? '' : '.min'}.js`;
let inited = false;
let hls;

function createElement(opts) {
  const el = document.createElement(opts.tag || 'div');
  el.id = opts.id;
  el.className = opts.className;
  if (opts.attributes) {
    for (const key in opts.attributes) {
      el.setAttribute(key, opts.attributes[key]);
    }
  }
  return el;
}

const defaultConfig = {
  debug: IS_DEV,
  // autoplay: true,
  controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume'],
  ads: {
    autoplay: true,
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
  const playListPath = `${HOST}configs/`;

  return fetch(`${playListPath}${playlistFileName}`).then((data) => {
    return data.json();
  });
}

function checkAutoplay(player) {
  player.autoPlayController.performCheck().then((result) => {
    if (result.autoplayAllowed) {
      player.play();
    }
  });
}

function setToPlay(player, item, config, forcePlay) {
  if (config.adsNeed) {
    config.ads.response = createVmap(item.ads);
    player.ads.config = config.ads;
    player.ads.loadAds();
  }

  if (item.isHls) {
    if (!hls) {
      hls = new Hls();

      hls.attachMedia(player.media);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (player.autoPlayController.isChecked && player.autoPlayController.autoplayAllowed || forcePlay) {
          player.media.play();
        } else {
          checkAutoplay(player);
        }
      });
    }

    hls.loadSource(item.sources[0].src);
  } else {
    player.source = item;

    if (player.autoPlayController.isChecked && player.autoPlayController.autoplayAllowed || forcePlay) {
      player.play();
    } else {
      checkAutoplay(player);
    }
  }
}

function loadPlayerSrc(element, playlistData) {
  const jsSources = [`${HOST}${PLAYER_FILE_NAME}?cb=${Math.random()}`];
  const config = { ...defaultConfig };
  let hasHlsItems = false;

  if (config.useHLS && Hls.isSupported()) {
    playlistData.forEach((item) => {
      if (item.sources[0].type === 'application/x-mpegURL') {
        item.isHls = true;
        hasHlsItems = true;
      }
    });
  }

  if (hasHlsItems) {
    jsSources.push(HLS_URL);
  }

  return Promise.all(jsSources.map(loadScript)).then(() => {
    let currentPlaylistIndex = 0;

    config.ads.response = createVmap(playlistData[0].ads);
    const player = new bidmaticPlyr(element, config);
    player.autoPlayController = new AutoplayController(player);

    player.ads.on('loaded', () => {
      player.triggerResize();
    });

    player.on('ended', () => {
      currentPlaylistIndex += 1;
      config.adsNeed = true;

      if (currentPlaylistIndex < playlistData.length) {
        setToPlay(player, playlistData[currentPlaylistIndex], config, true);
      }
    });

    setToPlay(player, playlistData[currentPlaylistIndex], config);

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
      playsinline: '',
    },
  });

  container.appendChild(mainContainer);
  mainContainer.appendChild(detachableContainer);
  detachableContainer.appendChild(videoTag);

  downloadConfig(container.getAttribute('data-detachable-player')).then((playerConfig) => {
    const detachConfig = playerConfig.detach;
    const detachable = new Detachable(`#${detachId}`, {
      position: detachConfig && detachConfig.position,
      size: detachConfig && detachConfig.size,
    });
    const styleURL = `${HOST}integration.css?cb=${Math.random()}`;

    loadStyles(styleURL);
    loadPlayerSrc(videoTag, playerConfig.playlist).then((playerInstance) => {
      detachable.player = playerInstance;
      if (IS_DEV) {
        window.player = playerInstance;
      }
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
