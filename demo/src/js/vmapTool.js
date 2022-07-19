const VMAP_OPEN = `<?xml version="1.0" encoding="UTF-8"?><vmap:VMAP xmlns:vmap="http://www.iab.net/videosuite/vmap" version="1.0">`;
const VMAP_CLOSE = `</vmap:VMAP>`;

export function createVmap(urlArray) {
  const vmapAdBreaks = urlArray.map((url, i) => {
    // language=XML
    return `<vmap:AdBreak timeOffset="start" breakType="linear" breakId="preroll${i}">
      <vmap:AdSource id="preroll-ad-${i + 1}" allowMultipleAds="false" followRedirects="true">
       <vmap:AdTagURI templateType="vast3"><![CDATA[${url}]]></vmap:AdTagURI>
      </vmap:AdSource>
     </vmap:AdBreak>`;
  });

  return `${VMAP_OPEN}${vmapAdBreaks.join('')}${VMAP_CLOSE}`;
}
