(function biliSponsorBlockPageBridge(globalScope) {
  if (globalScope.__BILI_SPONSORBLOCK_PAGE_BRIDGE__) {
    return;
  }

  globalScope.__BILI_SPONSORBLOCK_PAGE_BRIDGE__ = true;

  const EVENT_NAME = 'bili-sponsorblock:page-data';
  let lastSnapshotKey = '';

  function pickSubtitleTracks(playInfo) {
    const subtitleList =
      playInfo &&
      playInfo.data &&
      playInfo.data.subtitle &&
      Array.isArray(playInfo.data.subtitle.subtitles)
        ? playInfo.data.subtitle.subtitles
        : [];

    return subtitleList
      .map((item) => {
        const url = item && (item.subtitle_url || item.url);
        if (!url) {
          return null;
        }

        return {
          id: item.id || '',
          lang: item.lan || item.lang || '',
          langKey: item.lan_doc || item.lang_key || '',
          url: /^https?:\/\//i.test(url) ? url : 'https:' + url,
        };
      })
      .filter(Boolean);
  }

  function pickCid(initialState) {
    if (initialState && initialState.cid) {
      return String(initialState.cid);
    }

    if (initialState && initialState.videoData && initialState.videoData.cid) {
      return String(initialState.videoData.cid);
    }

    if (initialState && initialState.epInfo && initialState.epInfo.cid) {
      return String(initialState.epInfo.cid);
    }

    const currentPage =
      initialState && Number.isFinite(Number(initialState.p)) ? Number(initialState.p) : 1;
    const pages =
      initialState && initialState.videoData && Array.isArray(initialState.videoData.pages)
        ? initialState.videoData.pages
        : [];
    const matchedPage =
      pages.find((page) => Number(page.page) === currentPage) ||
      pages.find((page) => Number(page.page) === 1) ||
      pages[0];

    if (matchedPage && matchedPage.cid) {
      return String(matchedPage.cid);
    }

    return '';
  }

  function readSnapshot() {
    const initialState = globalScope.__INITIAL_STATE__ || {};
    const playInfo = globalScope.__playinfo__ || {};
    const pathnameMatch = globalScope.location.pathname.match(/\/video\/([^/?]+)/i);
    const bvid =
      (initialState && initialState.bvid) ||
      (initialState && initialState.videoData && initialState.videoData.bvid) ||
      (pathnameMatch ? pathnameMatch[1] : '');

    const title =
      (initialState && initialState.videoData && initialState.videoData.title) ||
      (initialState && initialState.h1Title) ||
      document.title.replace(/\s*-\s*哔哩哔哩.*$/i, '');

    const durationSeconds =
      (initialState && initialState.videoData && initialState.videoData.duration) ||
      (initialState && initialState.epInfo && initialState.epInfo.duration) ||
      (playInfo &&
        playInfo.data &&
        playInfo.data.timelength &&
        Number(playInfo.data.timelength) / 1000) ||
      0;

    const snapshot = {
      bvid: bvid ? String(bvid) : '',
      cid: pickCid(initialState),
      epId:
        initialState && initialState.epInfo && initialState.epInfo.id
          ? String(initialState.epInfo.id)
          : '',
      p:
        initialState && Number.isFinite(Number(initialState.p)) ? Number(initialState.p) : 1,
      title: title ? String(title).trim() : '',
      durationMs: Math.round(Number(durationSeconds || 0) * 1000),
      subtitleTracks: pickSubtitleTracks(playInfo),
    };

    if (!snapshot.bvid && pathnameMatch) {
      snapshot.bvid = pathnameMatch[1];
    }

    if (!snapshot.cid) {
      snapshot.cid = snapshot.bvid ? snapshot.bvid + ':p' + String(snapshot.p || 1) : '';
    }

    return snapshot;
  }

  function emitSnapshot() {
    const snapshot = readSnapshot();
    const snapshotKey = JSON.stringify(snapshot);
    if (!snapshot.bvid || snapshotKey === lastSnapshotKey) {
      return;
    }

    lastSnapshotKey = snapshotKey;
    document.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: snapshot,
      })
    );
  }

  const pushState = history.pushState;
  const replaceState = history.replaceState;

  history.pushState = function patchedPushState() {
    const result = pushState.apply(this, arguments);
    globalScope.setTimeout(emitSnapshot, 0);
    return result;
  };

  history.replaceState = function patchedReplaceState() {
    const result = replaceState.apply(this, arguments);
    globalScope.setTimeout(emitSnapshot, 0);
    return result;
  };

  globalScope.addEventListener('load', emitSnapshot);
  globalScope.addEventListener('popstate', emitSnapshot);

  const observer = new MutationObserver(() => {
    emitSnapshot();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  emitSnapshot();
})(window);
