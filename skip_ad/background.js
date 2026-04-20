importScripts('common.js', 'config.js');

(function biliSponsorBlockBackground(globalScope) {
  const shared = globalScope.BILI_SPONSORBLOCK_SHARED;
  const config = globalScope.BILI_SPONSOR_BLOCK_CONFIG || {};

  const storageKeys = {
    deviceProfile: 'biliSponsorBlock:device-profile',
    lookupCache: 'biliSponsorBlock:lookup-cache',
    analysisRequests: 'biliSponsorBlock:analysis-requests',
  };

  const defaultRemoteConfig = {
    enabled: false,
    functionsBaseUrl: '',
    anonKey: '',
    requestTimeoutMs: 8000,
    cacheTtlMs: 24 * 60 * 60 * 1000,
    analysisCooldownMs: 10 * 60 * 1000,
  };

  const remoteConfig = Object.assign({}, defaultRemoteConfig, config.remoteApi || {});

  chrome.runtime.onInstalled.addListener(() => {
    void ensureDeviceProfile();
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    handleMessage(message)
      .then((result) => {
        sendResponse({ ok: true, result: result });
      })
      .catch((error) => {
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        });
      });

    return true;
  });

  async function handleMessage(message) {
    const type = message && message.type;
    const payload = message && message.payload ? message.payload : {};

    switch (type) {
      case shared.messageTypes.ensureIdentity:
        return ensureDeviceProfile();
      case shared.messageTypes.lookupSegments:
        return lookupSegments(payload);
      case shared.messageTypes.requestAnalysis:
        return requestAnalysis(payload);
      case shared.messageTypes.submitMark:
        return submitMark(payload);
      case shared.messageTypes.submitFeedback:
        return submitFeedback(payload);
      case shared.messageTypes.fetchSubtitleTrack:
        return fetchSubtitleTrack(payload);
      default:
        throw new Error('Unknown message type');
    }
  }

  async function readStorage(key) {
    const stored = await chrome.storage.local.get(key);
    return stored[key];
  }

  async function writeStorage(key, value) {
    await chrome.storage.local.set({
      [key]: value,
    });
  }

  function isRemoteEnabled() {
    return Boolean(
      remoteConfig.enabled &&
        typeof remoteConfig.functionsBaseUrl === 'string' &&
        remoteConfig.functionsBaseUrl.trim() &&
        typeof remoteConfig.anonKey === 'string' &&
        remoteConfig.anonKey.trim()
    );
  }

  function createTimeoutController(timeoutMs) {
    const controller = new AbortController();
    const timerId = globalScope.setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    return {
      controller: controller,
      dispose() {
        globalScope.clearTimeout(timerId);
      },
    };
  }

  async function ensureDeviceProfile() {
    const existing = await readStorage(storageKeys.deviceProfile);
    if (existing && typeof existing.deviceId === 'string' && existing.deviceId.trim()) {
      return existing;
    }

    const created = {
      deviceId: shared.createId('device'),
      createdAt: Date.now(),
    };

    await writeStorage(storageKeys.deviceProfile, created);
    return created;
  }

  function readLocalSegments(identity) {
    return ((config.defaultSegmentsByVideoId || {})[identity.bvid] || [])
      .map((segment, index) => shared.normalizeLocalSegment(segment, index, identity))
      .filter(Boolean);
  }

  async function getLookupCache() {
    return (await readStorage(storageKeys.lookupCache)) || {};
  }

  async function setLookupCacheEntry(identityKey, payload) {
    const existing = await getLookupCache();
    existing[identityKey] = payload;
    await writeStorage(storageKeys.lookupCache, existing);
  }

  async function getCachedLookup(identityKey) {
    const lookupCache = await getLookupCache();
    const cached = lookupCache[identityKey];
    if (!cached || typeof cached !== 'object') {
      return null;
    }

    if (Number(cached.expiresAt || 0) <= Date.now()) {
      delete lookupCache[identityKey];
      await writeStorage(storageKeys.lookupCache, lookupCache);
      return null;
    }

    return cached.payload || null;
  }

  async function callRemoteFunction(path, payload, authToken) {
    const timeout = createTimeoutController(remoteConfig.requestTimeoutMs);

    try {
      const response = await fetch(joinUrl(remoteConfig.functionsBaseUrl, path), {
        method: 'POST',
        signal: timeout.controller.signal,
        headers: {
          'Content-Type': 'application/json',
          apikey: remoteConfig.anonKey,
          Authorization: 'Bearer ' + (authToken || remoteConfig.anonKey),
        },
        body: JSON.stringify(payload),
      });

      const parsed = await response.json();
      if (!response.ok) {
        throw new Error((parsed && parsed.error) || 'Remote request failed');
      }

      return parsed;
    } finally {
      timeout.dispose();
    }
  }

  function joinUrl(baseUrl, path) {
    const normalizedBase = String(baseUrl || '').replace(/\/+$/, '');
    const normalizedPath = String(path || '').replace(/^\/+/, '');
    return normalizedBase + '/' + normalizedPath;
  }

  async function lookupSegments(payload) {
    const identity = shared.normalizeVideoIdentity(payload.identity);
    if (!identity) {
      throw new Error('Missing video identity');
    }

    const deviceProfile = await ensureDeviceProfile();
    const identityKey = shared.createVideoCacheKey(identity);
    const localSegments = readLocalSegments(identity);
    const fallbackResult = {
      status: localSegments.length ? 'ready' : 'missing',
      segments: localSegments,
      subtitleAvailable: false,
      requestedAnalysis: false,
      source: 'local-only',
      deviceId: deviceProfile.deviceId,
      videoId: identityKey,
    };

    if (!isRemoteEnabled()) {
      return fallbackResult;
    }

    const cached = await getCachedLookup(identityKey);
    if (cached) {
      return mergeLookupResult(identity, deviceProfile.deviceId, cached, localSegments, 'cache');
    }

    try {
      const remote = await callRemoteFunction('lookup-segments', {
        bvid: identity.bvid,
        cid: identity.cid,
        epId: identity.epId,
        title: payload.metadata && payload.metadata.title ? payload.metadata.title : undefined,
        durationMs:
          payload.metadata && Number.isFinite(Number(payload.metadata.durationMs))
            ? Number(payload.metadata.durationMs)
            : undefined,
      });

      await setLookupCacheEntry(identityKey, {
        expiresAt: Date.now() + remoteConfig.cacheTtlMs,
        payload: remote,
      });

      return mergeLookupResult(identity, deviceProfile.deviceId, remote, localSegments, 'remote');
    } catch (error) {
      const fallbackCached = await getCachedLookup(identityKey);
      if (fallbackCached) {
        return mergeLookupResult(
          identity,
          deviceProfile.deviceId,
          fallbackCached,
          localSegments,
          'cache-fallback'
        );
      }

      return Object.assign({}, fallbackResult, {
        source: 'remote-error',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  function mergeLookupResult(identity, deviceId, remote, localSegments, source) {
    const remoteSegments = Array.isArray(remote && remote.segments)
      ? remote.segments
          .map((segment, index) => shared.normalizeRemoteSegment(segment, index, identity))
          .filter(Boolean)
      : [];

    const mergedSegments = shared
      .dedupeSegments(remoteSegments.concat(localSegments))
      .sort((left, right) => left.startMs - right.startMs);

    return {
      status:
        remote && typeof remote.status === 'string'
          ? remote.status
          : mergedSegments.length
            ? 'ready'
            : 'missing',
      segments: mergedSegments,
      subtitleAvailable: Boolean(remote && remote.subtitleAvailable),
      requestedAnalysis: Boolean(remote && remote.requestedAnalysis),
      source: source,
      videoId:
        remote && typeof remote.videoId === 'string' && remote.videoId.trim()
          ? remote.videoId
          : shared.createVideoCacheKey(identity),
      deviceId: deviceId,
    };
  }

  async function getAnalysisRequests() {
    return (await readStorage(storageKeys.analysisRequests)) || {};
  }

  async function requestAnalysis(payload) {
    const identity = shared.normalizeVideoIdentity(payload.identity);
    if (!identity) {
      throw new Error('Missing video identity');
    }

    const deviceProfile = await ensureDeviceProfile();
    if (!isRemoteEnabled()) {
      return {
        accepted: false,
        status: 'disabled',
        deviceId: deviceProfile.deviceId,
      };
    }

    const identityKey = shared.createVideoCacheKey(identity);
    const history = await getAnalysisRequests();
    const recentRequestAt = Number(history[identityKey] || 0);
    if (recentRequestAt && Date.now() - recentRequestAt < remoteConfig.analysisCooldownMs) {
      return {
        accepted: false,
        status: 'cooldown',
        deviceId: deviceProfile.deviceId,
      };
    }

    const remote = await callRemoteFunction('request-analysis', {
      bvid: identity.bvid,
      cid: identity.cid,
      epId: identity.epId,
      title: payload.metadata && payload.metadata.title ? payload.metadata.title : undefined,
      durationMs:
        payload.metadata && Number.isFinite(Number(payload.metadata.durationMs))
          ? Number(payload.metadata.durationMs)
          : undefined,
      trigger: payload.trigger || 'lookup_miss',
    });

    history[identityKey] = Date.now();
    await writeStorage(storageKeys.analysisRequests, history);

    return {
      accepted: Boolean(remote && remote.accepted),
      status: remote && remote.status ? remote.status : 'queued',
      jobId: remote && remote.jobId ? remote.jobId : null,
      deviceId: deviceProfile.deviceId,
    };
  }

  async function submitMark(payload) {
    const identity = shared.normalizeVideoIdentity(payload.identity);
    if (!identity) {
      throw new Error('Missing video identity');
    }

    const deviceProfile = await ensureDeviceProfile();
    if (!isRemoteEnabled()) {
      return {
        accepted: false,
        status: 'disabled',
        deviceId: deviceProfile.deviceId,
      };
    }

    const remote = await callRemoteFunction('submit-mark', {
      bvid: identity.bvid,
      cid: identity.cid,
      epId: identity.epId,
      startMs: Number(payload.startMs),
      endMs: Number(payload.endMs),
      label:
        typeof payload.label === 'string' && payload.label.trim()
          ? payload.label.trim()
          : '\u624b\u52a8\u6807\u8bb0',
      snappedToSubtitle: Boolean(payload.snappedToSubtitle),
      actor: {
        deviceId: deviceProfile.deviceId,
      },
    });

    return {
      accepted: Boolean(remote && remote.accepted),
      proposalId: remote && remote.proposalId ? remote.proposalId : null,
      deviceId: deviceProfile.deviceId,
    };
  }

  async function submitFeedback(payload) {
    const identity = shared.normalizeVideoIdentity(payload.identity);
    if (!identity) {
      throw new Error('Missing video identity');
    }

    const deviceProfile = await ensureDeviceProfile();
    if (!isRemoteEnabled()) {
      return {
        accepted: false,
        status: 'disabled',
        deviceId: deviceProfile.deviceId,
        localOverride: {
          muteUntilReload: payload.action === 'not_ad',
        },
      };
    }

    const remote = await callRemoteFunction('submit-feedback', {
      bvid: identity.bvid,
      cid: identity.cid,
      epId: identity.epId,
      segmentId: payload.segmentId,
      action: payload.action,
      deltaStartMs:
        Number.isFinite(Number(payload.deltaStartMs)) ? Number(payload.deltaStartMs) : undefined,
      deltaEndMs:
        Number.isFinite(Number(payload.deltaEndMs)) ? Number(payload.deltaEndMs) : undefined,
      actor: {
        deviceId: deviceProfile.deviceId,
      },
    });

    return {
      accepted: Boolean(remote && remote.accepted),
      localOverride:
        remote && remote.localOverride
          ? remote.localOverride
          : {
              muteUntilReload: payload.action === 'not_ad',
            },
      deviceId: deviceProfile.deviceId,
    };
  }

  async function fetchSubtitleTrack(payload) {
    const subtitleUrl = payload && typeof payload.url === 'string' ? payload.url.trim() : '';
    if (!subtitleUrl) {
      return {
        lines: [],
      };
    }

    const timeout = createTimeoutController(remoteConfig.requestTimeoutMs);

    try {
      const response = await fetch(subtitleUrl, {
        method: 'GET',
        signal: timeout.controller.signal,
      });

      if (!response.ok) {
        throw new Error('Subtitle request failed');
      }

      const parsed = await response.json();
      const rawLines = Array.isArray(parsed && parsed.body)
        ? parsed.body
        : Array.isArray(parsed && parsed.data && parsed.data.body)
          ? parsed.data.body
          : [];

      const lines = rawLines
        .map((line, index) =>
          shared.normalizeSubtitleLine(
            {
              lineIndex: index,
              startMs: Number(line.from || line.start || 0) * 1000,
              endMs: Number(line.to || line.end || 0) * 1000,
              text: line.content || line.text || '',
            },
            index
          )
        )
        .filter(Boolean);

      return {
        lines: lines,
      };
    } finally {
      timeout.dispose();
    }
  }
})(globalThis);
