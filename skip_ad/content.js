(function biliSponsorBlockM1(globalScope) {
  const shared = globalScope.BILI_SPONSORBLOCK_SHARED;
  const config = globalScope.BILI_SPONSOR_BLOCK_CONFIG || {};
  const uiConfig = Object.assign(
    {
      overlayDurationMs: 6000,
      undoIgnoreDurationMs: 30000,
      skipPaddingSeconds: 0.15,
      debug: false,
      hotkeys: {
        setStart: 'Alt+[',
        setEnd: 'Alt+]',
        submit: 'Alt+\\',
      },
    },
    config
  );

  const state = {
    currentUrl: globalScope.location.href,
    currentIdentity: null,
    currentMetadata: null,
    currentVideoId: '',
    segments: [],
    videoElement: null,
    subtitleLines: [],
    subtitleTrackUrl: '',
    ignoredSegmentsUntil: new Map(),
    mutedSegments: new Set(),
    lastSkip: null,
    navigationHooksInstalled: false,
    pageBridgeInstalled: false,
    rebindingTimerId: 0,
    hideOverlayTimerId: 0,
    markDraft: {
      startMs: null,
      endMs: null,
      snappedToSubtitle: false,
      label: '\u624b\u52a8\u6807\u8bb0',
    },
    ui: {},
  };

  const listeners = {
    onVideoProgress: () => {
      maybeSkipCurrentSegment();
    },
    onNavigation: () => {
      scheduleRefresh();
    },
    onPageData: (event) => {
      void handlePageData(event.detail);
    },
    onKeydown: (event) => {
      handleHotkey(event);
    },
  };

  function log(message, payload) {
    if (!uiConfig.debug) {
      return;
    }

    console.info('[Bili SponsorBlock]', message, payload || '');
  }

  function createRuntimeMessage(type, payload) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: type,
          payload: payload,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          if (!response || !response.ok) {
            reject(new Error((response && response.error) || 'Runtime message failed'));
            return;
          }

          resolve(response.result);
        }
      );
    });
  }

  function formatTimeFromMs(milliseconds) {
    const totalSeconds = Math.max(0, Math.floor(Number(milliseconds || 0) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return [hours, minutes, seconds]
        .map((value) => String(value).padStart(2, '0'))
        .join(':');
    }

    return [minutes, seconds]
      .map((value) => String(value).padStart(2, '0'))
      .join(':');
  }

  function ensureBridge() {
    if (state.pageBridgeInstalled) {
      return;
    }

    state.pageBridgeInstalled = true;
    document.addEventListener('bili-sponsorblock:page-data', listeners.onPageData);

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('page-bridge.js');
    script.async = false;
    script.onload = () => {
      script.remove();
    };

    (document.head || document.documentElement).appendChild(script);
  }

  function ensureUi() {
    if (state.ui.overlay) {
      return;
    }

    const overlay = document.createElement('section');
    overlay.id = 'bili-sponsorblock-overlay';
    overlay.dataset.visible = 'false';

    const overlayHeader = document.createElement('div');
    overlayHeader.id = 'bili-sponsorblock-overlay__header';

    const overlayTitle = document.createElement('div');
    overlayTitle.id = 'bili-sponsorblock-overlay__title';
    overlayTitle.textContent = 'SponsorBlock';

    const overlayText = document.createElement('div');
    overlayText.id = 'bili-sponsorblock-overlay__text';

    overlayHeader.appendChild(overlayTitle);
    overlayHeader.appendChild(overlayText);

    const overlayActions = document.createElement('div');
    overlayActions.id = 'bili-sponsorblock-overlay__actions';

    const overlayButtons = [
      createActionButton('\u64a4\u9500', () => {
        undoLastSkip();
      }),
      createActionButton('\u4e0d\u662f\u5e7f\u544a', () => {
        void submitOverlayFeedback('not_ad');
      }),
      createActionButton('\u5f00\u59cb\u592a\u65e9', () => {
        void submitOverlayFeedback('adjust', 1000, 0);
      }),
      createActionButton('\u5f00\u59cb\u592a\u665a', () => {
        void submitOverlayFeedback('adjust', -1000, 0);
      }),
      createActionButton('\u7ed3\u675f\u592a\u65e9', () => {
        void submitOverlayFeedback('adjust', 0, 1000);
      }),
      createActionButton('\u7ed3\u675f\u592a\u665a', () => {
        void submitOverlayFeedback('adjust', 0, -1000);
      }),
    ];

    overlayButtons.forEach((button) => {
      overlayActions.appendChild(button);
    });

    overlay.appendChild(overlayHeader);
    overlay.appendChild(overlayActions);

    const toolbox = document.createElement('section');
    toolbox.id = 'bili-sponsorblock-toolbox';

    const toolboxTitle = document.createElement('div');
    toolboxTitle.id = 'bili-sponsorblock-toolbox__title';
    toolboxTitle.textContent = 'SponsorBlock';

    const toolboxStatus = document.createElement('div');
    toolboxStatus.id = 'bili-sponsorblock-toolbox__status';
    toolboxStatus.textContent = '\u672a\u547d\u4e2d\u89c6\u9891';

    const toolboxDraft = document.createElement('div');
    toolboxDraft.id = 'bili-sponsorblock-toolbox__draft';

    const draftStart = document.createElement('div');
    draftStart.id = 'bili-sponsorblock-toolbox__draft-start';

    const draftEnd = document.createElement('div');
    draftEnd.id = 'bili-sponsorblock-toolbox__draft-end';

    toolboxDraft.appendChild(draftStart);
    toolboxDraft.appendChild(draftEnd);

    const toolboxActions = document.createElement('div');
    toolboxActions.id = 'bili-sponsorblock-toolbox__actions';

    const setStartButton = createActionButton('\u8bbe\u4e3a\u5f00\u59cb', () => {
      captureMarkBoundary('start');
    });
    const setEndButton = createActionButton('\u8bbe\u4e3a\u7ed3\u675f', () => {
      captureMarkBoundary('end');
    });
    const submitButton = createActionButton('\u63d0\u4ea4', () => {
      void submitManualMark();
    });
    const resetButton = createActionButton('\u6e05\u9664', () => {
      resetDraft();
    });

    [setStartButton, setEndButton, submitButton, resetButton].forEach((button) => {
      toolboxActions.appendChild(button);
    });

    const adjustRow = document.createElement('div');
    adjustRow.id = 'bili-sponsorblock-toolbox__adjust';

    [
      { label: '-1s', delta: -1000 },
      { label: '-0.5s', delta: -500 },
      { label: '+0.5s', delta: 500 },
      { label: '+1s', delta: 1000 },
    ].forEach((item) => {
      const button = createActionButton(item.label, () => {
        adjustDraftBoundary(item.delta);
      });
      adjustRow.appendChild(button);
    });

    const shortcutHint = document.createElement('div');
    shortcutHint.id = 'bili-sponsorblock-toolbox__hint';
    shortcutHint.textContent =
      uiConfig.hotkeys.setStart +
      ' / ' +
      uiConfig.hotkeys.setEnd +
      ' / ' +
      uiConfig.hotkeys.submit;

    toolbox.appendChild(toolboxTitle);
    toolbox.appendChild(toolboxStatus);
    toolbox.appendChild(toolboxDraft);
    toolbox.appendChild(toolboxActions);
    toolbox.appendChild(adjustRow);
    toolbox.appendChild(shortcutHint);

    document.documentElement.appendChild(overlay);
    document.documentElement.appendChild(toolbox);

    state.ui = {
      overlay: overlay,
      overlayText: overlayText,
      toolboxStatus: toolboxStatus,
      draftStart: draftStart,
      draftEnd: draftEnd,
    };

    refreshDraftUi();
  }

  function createActionButton(label, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'bili-sponsorblock-button';
    button.textContent = label;
    button.addEventListener('click', onClick);
    return button;
  }

  function showOverlay(skipRecord) {
    ensureUi();

    if (!state.ui.overlay || !state.ui.overlayText) {
      return;
    }

    state.ui.overlayText.textContent =
      '\u5df2\u8df3\u8fc7 ' +
      (skipRecord.segment.label || '\u63a8\u5e7f\u7247\u6bb5') +
      ' (' +
      formatTimeFromMs(skipRecord.segment.startMs) +
      ' - ' +
      formatTimeFromMs(skipRecord.segment.endMs) +
      ')';

    state.ui.overlay.dataset.visible = 'true';

    if (state.hideOverlayTimerId) {
      globalScope.clearTimeout(state.hideOverlayTimerId);
    }

    state.hideOverlayTimerId = globalScope.setTimeout(() => {
      hideOverlay();
    }, uiConfig.overlayDurationMs);
  }

  function hideOverlay() {
    if (state.ui.overlay) {
      state.ui.overlay.dataset.visible = 'false';
    }
  }

  function updateStatus(text) {
    ensureUi();
    if (state.ui.toolboxStatus) {
      state.ui.toolboxStatus.textContent = text;
    }
  }

  function refreshDraftUi() {
    ensureUi();

    if (!state.ui.draftStart || !state.ui.draftEnd) {
      return;
    }

    state.ui.draftStart.textContent =
      '\u5f00\u59cb\uff1a' +
      (state.markDraft.startMs === null
        ? '--:--'
        : formatTimeFromMs(state.markDraft.startMs) +
          (state.markDraft.snappedToSubtitle ? ' (\u5438\u9644\u5b57\u5e55)' : ''));
    state.ui.draftEnd.textContent =
      '\u7ed3\u675f\uff1a' +
      (state.markDraft.endMs === null ? '--:--' : formatTimeFromMs(state.markDraft.endMs));
  }

  function resetDraft() {
    state.markDraft.startMs = null;
    state.markDraft.endMs = null;
    state.markDraft.snappedToSubtitle = false;
    refreshDraftUi();
  }

  function adjustDraftBoundary(deltaMs) {
    if (state.markDraft.endMs !== null) {
      state.markDraft.endMs = Math.max(
        state.markDraft.startMs !== null ? state.markDraft.startMs + 250 : 250,
        state.markDraft.endMs + deltaMs
      );
    } else if (state.markDraft.startMs !== null) {
      state.markDraft.startMs = Math.max(0, state.markDraft.startMs + deltaMs);
    }

    state.markDraft.snappedToSubtitle = false;
    refreshDraftUi();
  }

  function captureMarkBoundary(type) {
    if (!state.videoElement) {
      updateStatus('\u672a\u627e\u5230\u89c6\u9891\u5143\u7d20');
      return;
    }

    const currentMs = Math.round(state.videoElement.currentTime * 1000);
    const snapped = snapToSubtitle(currentMs, type);

    if (type === 'start') {
      state.markDraft.startMs = snapped.value;
      state.markDraft.snappedToSubtitle = snapped.snapped;
      if (
        state.markDraft.endMs !== null &&
        state.markDraft.endMs <= state.markDraft.startMs
      ) {
        state.markDraft.endMs = state.markDraft.startMs + 1000;
      }
    }

    if (type === 'end') {
      state.markDraft.endMs = snapped.value;
      state.markDraft.snappedToSubtitle = state.markDraft.snappedToSubtitle || snapped.snapped;
      if (
        state.markDraft.startMs !== null &&
        state.markDraft.endMs <= state.markDraft.startMs
      ) {
        state.markDraft.startMs = Math.max(0, state.markDraft.endMs - 1000);
      }
    }

    refreshDraftUi();
    updateStatus('\u5df2\u8bb0\u5f55' + (type === 'start' ? '\u5f00\u59cb' : '\u7ed3\u675f'));
  }

  function snapToSubtitle(currentMs, type) {
    if (!state.subtitleLines.length) {
      return {
        value: currentMs,
        snapped: false,
      };
    }

    let best = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    state.subtitleLines.forEach((line) => {
      const candidate = type === 'start' ? line.startMs : line.endMs;
      const distance = Math.abs(candidate - currentMs);
      if (distance < bestDistance) {
        best = candidate;
        bestDistance = distance;
      }
    });

    if (best === null || bestDistance > 2500) {
      return {
        value: currentMs,
        snapped: false,
      };
    }

    return {
      value: best,
      snapped: true,
    };
  }

  function isEditableTarget(target) {
    if (!target || !(target instanceof Element)) {
      return false;
    }

    return Boolean(target.closest('input, textarea, [contenteditable="true"]'));
  }

  function handleHotkey(event) {
    if (!event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) {
      return;
    }

    if (isEditableTarget(event.target)) {
      return;
    }

    if (event.key === '[') {
      event.preventDefault();
      captureMarkBoundary('start');
      return;
    }

    if (event.key === ']') {
      event.preventDefault();
      captureMarkBoundary('end');
      return;
    }

    if (event.key === '\\') {
      event.preventDefault();
      void submitManualMark();
    }
  }

  function getFallbackIdentityFromLocation() {
    const pathnameMatch = globalScope.location.pathname.match(/\/video\/([^/?]+)/i);
    if (!pathnameMatch) {
      return null;
    }

    const query = new URLSearchParams(globalScope.location.search);
    const p = query.get('p') || '1';
    return {
      bvid: pathnameMatch[1],
      cid: pathnameMatch[1] + ':p' + p,
      epId: '',
      title: document.title,
      durationMs: state.videoElement ? Math.round((state.videoElement.duration || 0) * 1000) : 0,
      subtitleTracks: [],
    };
  }

  async function handlePageData(pageData) {
    const mergedPageData = pageData && pageData.bvid ? pageData : getFallbackIdentityFromLocation();
    if (!mergedPageData || !mergedPageData.bvid) {
      return;
    }

    const identity = shared.normalizeVideoIdentity({
      bvid: mergedPageData.bvid,
      cid: mergedPageData.cid,
      epId: mergedPageData.epId,
    });
    if (!identity) {
      return;
    }

    const identityKey = shared.createVideoCacheKey(identity);
    const changed = identityKey !== state.currentVideoId;

    state.currentUrl = globalScope.location.href;
    state.currentIdentity = identity;
    state.currentMetadata = {
      title: mergedPageData.title || document.title,
      durationMs:
        Number.isFinite(Number(mergedPageData.durationMs)) && Number(mergedPageData.durationMs) > 0
          ? Number(mergedPageData.durationMs)
          : state.videoElement
            ? Math.round((state.videoElement.duration || 0) * 1000)
            : 0,
    };

    if (!changed) {
      return;
    }

    state.currentVideoId = identityKey;
    state.subtitleTrackUrl = pickPreferredSubtitleTrack(mergedPageData.subtitleTracks || []);
    state.subtitleLines = [];
    state.ignoredSegmentsUntil.clear();
    state.mutedSegments.clear();
    state.lastSkip = null;
    resetDraft();

    await hydrateSegments();
    await hydrateSubtitleLines();
  }

  function pickPreferredSubtitleTrack(subtitleTracks) {
    if (!Array.isArray(subtitleTracks) || !subtitleTracks.length) {
      return '';
    }

    const preferred =
      subtitleTracks.find((track) => /zh-CN|zh-Hans|中文/i.test(track.lang || '')) ||
      subtitleTracks.find((track) => /zh/i.test(track.lang || '')) ||
      subtitleTracks[0];

    return preferred && preferred.url ? preferred.url : '';
  }

  async function hydrateSegments() {
    if (!state.currentIdentity) {
      return;
    }

    try {
      const lookup = await createRuntimeMessage(shared.messageTypes.lookupSegments, {
        identity: state.currentIdentity,
        metadata: state.currentMetadata,
      });

      state.segments = Array.isArray(lookup.segments) ? lookup.segments : [];

      if (lookup.status === 'ready' && state.segments.length) {
        updateStatus('\u5df2\u52a0\u8f7d ' + String(state.segments.length) + ' \u4e2a\u5171\u4eab\u7247\u6bb5');
      } else if (lookup.status === 'processing') {
        updateStatus('\u670d\u52a1\u7aef\u6b63\u5728\u5206\u6790\u8fd9\u6761\u89c6\u9891');
      } else {
        updateStatus('\u6682\u65e0\u5171\u4eab\u7247\u6bb5\uff0c\u5c1d\u8bd5\u8bf7\u6c42\u5206\u6790');
      }

      if (lookup.status === 'processing' || lookup.status === 'missing') {
        void triggerAnalysisRequest();
      }
    } catch (error) {
      updateStatus('\u52a0\u8f7d\u5171\u4eab\u7247\u6bb5\u5931\u8d25\uff0c\u5df2\u56de\u9000\u5230\u672c\u5730');
      log('Lookup failed', error);
    }
  }

  async function triggerAnalysisRequest() {
    if (!state.currentIdentity) {
      return;
    }

    try {
      const result = await createRuntimeMessage(shared.messageTypes.requestAnalysis, {
        identity: state.currentIdentity,
        metadata: state.currentMetadata,
        trigger: 'lookup_miss',
      });

      if (result.status === 'cooldown') {
        updateStatus('\u5206\u6790\u8bf7\u6c42\u5df2\u5728\u961f\u5217\u4e2d');
        return;
      }

      if (result.accepted) {
        updateStatus('\u5df2\u8bf7\u6c42\u670d\u52a1\u7aef\u5206\u6790');
      }
    } catch (error) {
      log('Request analysis failed', error);
    }
  }

  async function hydrateSubtitleLines() {
    if (!state.subtitleTrackUrl) {
      return;
    }

    try {
      const result = await createRuntimeMessage(shared.messageTypes.fetchSubtitleTrack, {
        url: state.subtitleTrackUrl,
      });

      state.subtitleLines = Array.isArray(result.lines) ? result.lines : [];
      if (state.subtitleLines.length) {
        updateStatus(
          '\u5df2\u52a0\u8f7d\u5b57\u5e55\u65f6\u95f4\u8f74\uff0c\u53ef\u8fdb\u884c\u5438\u9644\u6807\u6ce8'
        );
      }
    } catch (error) {
      log('Subtitle load failed', error);
    }
  }

  function isSegmentIgnored(segment) {
    if (state.mutedSegments.has(segment.id)) {
      return true;
    }

    const ignoredUntil = Number(state.ignoredSegmentsUntil.get(segment.id) || 0);
    if (!ignoredUntil) {
      return false;
    }

    if (ignoredUntil <= Date.now()) {
      state.ignoredSegmentsUntil.delete(segment.id);
      return false;
    }

    return true;
  }

  function getActiveSegment(currentMs) {
    return state.segments.find((segment) => {
      if (isSegmentIgnored(segment)) {
        return false;
      }

      return currentMs >= segment.startMs && currentMs < segment.endMs;
    });
  }

  function maybeSkipCurrentSegment() {
    const videoElement = state.videoElement;
    if (!videoElement || videoElement.seeking || !state.segments.length) {
      return;
    }

    const currentMs = Math.round(videoElement.currentTime * 1000);
    const activeSegment = getActiveSegment(currentMs);
    if (!activeSegment) {
      return;
    }

    const targetSeconds = Math.min(
      shared.msToSeconds(activeSegment.endMs) + uiConfig.skipPaddingSeconds,
      Number.isFinite(videoElement.duration)
        ? videoElement.duration
        : shared.msToSeconds(activeSegment.endMs)
    );

    if (targetSeconds <= videoElement.currentTime) {
      return;
    }

    state.lastSkip = {
      fromMs: currentMs,
      toMs: shared.secondsToMs(targetSeconds),
      segment: activeSegment,
    };

    videoElement.currentTime = targetSeconds;
    showOverlay(state.lastSkip);
  }

  function undoLastSkip() {
    if (!state.videoElement || !state.lastSkip) {
      return;
    }

    state.ignoredSegmentsUntil.set(
      state.lastSkip.segment.id,
      Date.now() + Number(uiConfig.undoIgnoreDurationMs || 30000)
    );
    state.videoElement.currentTime = shared.msToSeconds(state.lastSkip.fromMs);
    state.lastSkip = null;
    hideOverlay();
  }

  function applyLocalAdjustment(deltaStartMs, deltaEndMs) {
    if (!state.lastSkip) {
      return;
    }

    const segment = state.lastSkip.segment;
    segment.startMs = Math.max(0, segment.startMs + deltaStartMs);
    segment.endMs = Math.max(segment.startMs + 250, segment.endMs + deltaEndMs);

    if (deltaEndMs > 0 && state.videoElement) {
      state.videoElement.currentTime =
        shared.msToSeconds(segment.endMs) + Number(uiConfig.skipPaddingSeconds || 0);
    }

    if (deltaEndMs < 0 && state.videoElement) {
      state.videoElement.currentTime = shared.msToSeconds(segment.endMs);
    }

    showOverlay({
      segment: segment,
    });
  }

  async function submitOverlayFeedback(action, deltaStartMs, deltaEndMs) {
    if (!state.currentIdentity || !state.lastSkip) {
      return;
    }

    if (action === 'not_ad') {
      state.mutedSegments.add(state.lastSkip.segment.id);
    }

    if (action === 'adjust') {
      applyLocalAdjustment(deltaStartMs || 0, deltaEndMs || 0);
    }

    try {
      await createRuntimeMessage(shared.messageTypes.submitFeedback, {
        identity: state.currentIdentity,
        segmentId: state.lastSkip.segment.id,
        action: action,
        deltaStartMs: deltaStartMs,
        deltaEndMs: deltaEndMs,
      });
    } catch (error) {
      log('Submit feedback failed', error);
    }

    hideOverlay();
    updateStatus('\u5df2\u63d0\u4ea4\u53cd\u9988');
  }

  async function submitManualMark() {
    if (!state.currentIdentity) {
      updateStatus('\u65e0\u6cd5\u8bc6\u522b\u5f53\u524d\u89c6\u9891');
      return;
    }

    if (state.markDraft.startMs === null || state.markDraft.endMs === null) {
      updateStatus('\u8bf7\u5148\u8bb0\u5f55\u5f00\u59cb\u548c\u7ed3\u675f');
      return;
    }

    if (state.markDraft.endMs <= state.markDraft.startMs) {
      updateStatus('\u7ed3\u675f\u65f6\u95f4\u9700\u5927\u4e8e\u5f00\u59cb\u65f6\u95f4');
      return;
    }

    try {
      const result = await createRuntimeMessage(shared.messageTypes.submitMark, {
        identity: state.currentIdentity,
        startMs: state.markDraft.startMs,
        endMs: state.markDraft.endMs,
        label: state.markDraft.label,
        snappedToSubtitle: state.markDraft.snappedToSubtitle,
      });

      if (result.accepted) {
        updateStatus('\u5df2\u63d0\u4ea4\u4eba\u5de5\u6807\u6ce8');
        resetDraft();
      } else {
        updateStatus('\u8fdc\u7a0b API \u672a\u542f\u7528\uff0c\u6807\u6ce8\u672a\u4e0a\u4f20');
      }
    } catch (error) {
      updateStatus('\u63d0\u4ea4\u6807\u6ce8\u5931\u8d25');
      log('Submit mark failed', error);
    }
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
  }

  function findVideoElement() {
    return document.querySelector('video');
  }

  function refreshBindings() {
    state.currentUrl = globalScope.location.href;

    const nextVideoElement = findVideoElement();
    if (!nextVideoElement) {
      detachVideoListeners();
      hideOverlay();
      updateStatus('\u7b49\u5f85\u89c6\u9891\u5c31\u7eea');
      return;
    }

    attachVideoListeners(nextVideoElement);

    if (!state.currentIdentity) {
      void handlePageData(getFallbackIdentityFromLocation());
    }
  }

  function scheduleRefresh() {
    if (state.rebindingTimerId) {
      return;
    }

    state.rebindingTimerId = globalScope.setTimeout(() => {
      state.rebindingTimerId = 0;
      refreshBindings();
    }, 120);
  }

  function installNavigationHooks() {
    if (state.navigationHooksInstalled) {
      return;
    }

    state.navigationHooksInstalled = true;
    globalScope.addEventListener('keydown', listeners.onKeydown, true);

    const pushState = history.pushState;
    const replaceState = history.replaceState;

    history.pushState = function patchedPushState() {
      const result = pushState.apply(this, arguments);
      globalScope.dispatchEvent(new Event('bili-sponsorblock:navigation'));
      return result;
    };

    history.replaceState = function patchedReplaceState() {
      const result = replaceState.apply(this, arguments);
      globalScope.dispatchEvent(new Event('bili-sponsorblock:navigation'));
      return result;
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

    ensureUi();
    ensureBridge();
    installNavigationHooks();
    refreshBindings();
  }

  bootstrap();
})(globalThis);
