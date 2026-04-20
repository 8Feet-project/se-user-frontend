(function biliSponsorBlockMvp(globalScope) {
  const config = globalScope.BILI_SPONSOR_BLOCK_CONFIG || {
    overlayDurationMs: 6000,
    undoIgnoreDurationMs: 30000,
    skipPaddingSeconds: 0.15,
    debug: false,
    defaultSegmentsByVideoId: {},
  };

  const state = {
    currentUrl: globalScope.location.href,
    currentVideoId: '',
    segments: [],
    videoElement: null,
    overlayElement: null,
    overlayTextElement: null,
    overlayUndoButton: null,
    hideOverlayTimerId: 0,
    rebindingTimerId: 0,
    ignoredSegmentsUntil: new Map(),
    lastSkip: null,
    navigationHooksInstalled: false,
  };

  const listeners = {
    onVideoProgress: () => {
      maybeSkipCurrentSegment();
    },
    onUndoClick: () => {
      undoLastSkip();
    },
    onNavigation: () => {
      scheduleRefresh();
    },
  };

  function log(message, extra) {
    if (!config.debug) {
      return;
    }

    console.info('[Bili SponsorBlock]', message, extra || '');
  }

  function getCurrentVideoId() {
    const match = globalScope.location.pathname.match(/\/video\/([^/?]+)/i);
    return match ? match[1] : '';
  }

  function normalizeSegment(segment, index) {
    if (!segment || typeof segment.start !== 'number' || typeof segment.end !== 'number') {
      return null;
    }

    if (!Number.isFinite(segment.start) || !Number.isFinite(segment.end) || segment.end <= segment.start) {
      return null;
    }

    return {
      start: Math.max(0, segment.start),
      end: segment.end,
      label:
        typeof segment.label === 'string' && segment.label.trim()
          ? segment.label.trim()
          : '\u63a8\u5e7f\u7247\u6bb5 ' + String(index + 1),
      category:
        typeof segment.category === 'string' && segment.category.trim()
          ? segment.category.trim()
          : 'sponsor',
    };
  }

  function loadSegmentsForVideo(videoId) {
    const rawSegments = config.defaultSegmentsByVideoId[videoId] || [];
    return rawSegments
      .map(normalizeSegment)
      .filter(Boolean)
      .sort((left, right) => left.start - right.start);
  }

  function formatTime(seconds) {
    const totalSeconds = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    if (hours > 0) {
      return [hours, minutes, remainingSeconds]
        .map((value) => String(value).padStart(2, '0'))
        .join(':');
    }

    return [minutes, remainingSeconds]
      .map((value) => String(value).padStart(2, '0'))
      .join(':');
  }

  function getSegmentKey(segment) {
    return [state.currentVideoId, segment.start, segment.end, segment.label].join(':');
  }

  function ensureOverlay() {
    if (state.overlayElement) {
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'bili-sponsorblock-overlay';
    overlay.dataset.visible = 'false';

    const text = document.createElement('div');
    text.id = 'bili-sponsorblock-overlay__text';

    const undoButton = document.createElement('button');
    undoButton.id = 'bili-sponsorblock-overlay__undo';
    undoButton.type = 'button';
    undoButton.textContent = '\u64a4\u9500';
    undoButton.addEventListener('click', listeners.onUndoClick);

    overlay.appendChild(text);
    overlay.appendChild(undoButton);
    document.documentElement.appendChild(overlay);

    state.overlayElement = overlay;
    state.overlayTextElement = text;
    state.overlayUndoButton = undoButton;
  }

  function hideOverlay() {
    if (!state.overlayElement) {
      return;
    }

    state.overlayElement.dataset.visible = 'false';
  }

  function showOverlay(skipRecord) {
    ensureOverlay();

    if (!state.overlayTextElement || !state.overlayElement) {
      return;
    }

    const segmentLabel = skipRecord.segment.label || '\u63a8\u5e7f\u7247\u6bb5';
    state.overlayTextElement.textContent =
      '\u5df2\u8df3\u8fc7 ' +
      segmentLabel +
      ' (' +
      formatTime(skipRecord.segment.start) +
      ' - ' +
      formatTime(skipRecord.segment.end) +
      '), \u53ef\u64a4\u9500\u3002';
    state.overlayElement.dataset.visible = 'true';

    if (state.hideOverlayTimerId) {
      globalScope.clearTimeout(state.hideOverlayTimerId);
    }

    state.hideOverlayTimerId = globalScope.setTimeout(() => {
      hideOverlay();
    }, config.overlayDurationMs);
  }

  function clearExpiredIgnoreLocks() {
    const now = Date.now();

    state.ignoredSegmentsUntil.forEach((expiresAt, key) => {
      if (expiresAt <= now) {
        state.ignoredSegmentsUntil.delete(key);
      }
    });
  }

  function isSegmentIgnored(segment) {
    clearExpiredIgnoreLocks();
    return state.ignoredSegmentsUntil.has(getSegmentKey(segment));
  }

  function getActiveSegment(currentTime) {
    return state.segments.find((segment) => {
      if (isSegmentIgnored(segment)) {
        return false;
      }

      return currentTime >= segment.start && currentTime < segment.end;
    });
  }

  function maybeSkipCurrentSegment() {
    const videoElement = state.videoElement;
    if (!videoElement || videoElement.seeking || !state.segments.length) {
      return;
    }

    const activeSegment = getActiveSegment(videoElement.currentTime);
    if (!activeSegment) {
      return;
    }

    const targetTime = Math.min(
      activeSegment.end + config.skipPaddingSeconds,
      Number.isFinite(videoElement.duration) ? videoElement.duration : activeSegment.end + config.skipPaddingSeconds
    );

    if (targetTime <= videoElement.currentTime) {
      return;
    }

    const skipRecord = {
      fromTime: videoElement.currentTime,
      toTime: targetTime,
      segment: activeSegment,
    };

    state.lastSkip = skipRecord;
    videoElement.currentTime = targetTime;
    showOverlay(skipRecord);

    log('Skipped segment', skipRecord);
  }

  function undoLastSkip() {
    if (!state.videoElement || !state.lastSkip) {
      return;
    }

    const segmentKey = getSegmentKey(state.lastSkip.segment);
    const ignoredUntil = Date.now() + config.undoIgnoreDurationMs;

    state.ignoredSegmentsUntil.set(segmentKey, ignoredUntil);
    state.videoElement.currentTime = Math.max(0, state.lastSkip.fromTime);
    state.lastSkip = null;
    hideOverlay();

    log('Undo skip', {
      segmentKey: segmentKey,
      ignoredUntil: ignoredUntil,
    });
  }

  function detachVideoListeners() {
    if (!state.videoElement) {
      return;
    }

    state.videoElement.removeEventListener('timeupdate', listeners.onVideoProgress);
    state.videoElement.removeEventListener('seeked', listeners.onVideoProgress);
    state.videoElement.removeEventListener('loadedmetadata', listeners.onVideoProgress);
    state.videoElement = null;
  }

  function attachVideoListeners(videoElement) {
    if (!videoElement || videoElement === state.videoElement) {
      return;
    }

    detachVideoListeners();

    state.videoElement = videoElement;
    state.videoElement.addEventListener('timeupdate', listeners.onVideoProgress);
    state.videoElement.addEventListener('seeked', listeners.onVideoProgress);
    state.videoElement.addEventListener('loadedmetadata', listeners.onVideoProgress);

    log('Bound video element');
  }

  function findVideoElement() {
    return document.querySelector('video');
  }

  function refreshSegmentsAndBindings() {
    const nextVideoId = getCurrentVideoId();
    const urlChanged = state.currentUrl !== globalScope.location.href;
    const videoIdChanged = state.currentVideoId !== nextVideoId;

    if (urlChanged || videoIdChanged) {
      state.currentUrl = globalScope.location.href;
      state.currentVideoId = nextVideoId;
      state.segments = loadSegmentsForVideo(nextVideoId);
      state.lastSkip = null;
      state.ignoredSegmentsUntil.clear();

      log('Updated video context', {
        videoId: nextVideoId,
        segments: state.segments,
      });
    }

    const nextVideoElement = findVideoElement();

    if (!nextVideoElement) {
      detachVideoListeners();
      hideOverlay();
      return;
    }

    attachVideoListeners(nextVideoElement);
  }

  function scheduleRefresh() {
    if (state.rebindingTimerId) {
      return;
    }

    state.rebindingTimerId = globalScope.setTimeout(() => {
      state.rebindingTimerId = 0;
      refreshSegmentsAndBindings();
    }, 100);
  }

  function installNavigationHooks() {
    if (state.navigationHooksInstalled) {
      return;
    }

    state.navigationHooksInstalled = true;

    const pushState = history.pushState;
    const replaceState = history.replaceState;

    history.pushState = function patchedPushState() {
      const returnValue = pushState.apply(this, arguments);
      globalScope.dispatchEvent(new Event('bili-sponsorblock:navigation'));
      return returnValue;
    };

    history.replaceState = function patchedReplaceState() {
      const returnValue = replaceState.apply(this, arguments);
      globalScope.dispatchEvent(new Event('bili-sponsorblock:navigation'));
      return returnValue;
    };

    globalScope.addEventListener('popstate', listeners.onNavigation);
    globalScope.addEventListener('bili-sponsorblock:navigation', listeners.onNavigation);

    const observer = new MutationObserver(() => {
      scheduleRefresh();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  function bootstrap() {
    if (!/\/video\//i.test(globalScope.location.pathname)) {
      return;
    }

    ensureOverlay();
    installNavigationHooks();
    refreshSegmentsAndBindings();
  }

  bootstrap();
})(globalThis);
