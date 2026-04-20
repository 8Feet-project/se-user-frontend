(function initBiliSponsorBlockShared(globalScope) {
  const shared = {
    messageTypes: Object.freeze({
      ensureIdentity: 'bili-sponsorblock:ensure-identity',
      lookupSegments: 'bili-sponsorblock:lookup-segments',
      requestAnalysis: 'bili-sponsorblock:request-analysis',
      submitMark: 'bili-sponsorblock:submit-mark',
      submitFeedback: 'bili-sponsorblock:submit-feedback',
      fetchSubtitleTrack: 'bili-sponsorblock:fetch-subtitle-track',
    }),
    createVideoCacheKey(identity) {
      if (!identity || !identity.bvid) {
        return '';
      }

      return [identity.bvid, identity.cid || '', identity.epId || ''].join('::');
    },
    secondsToMs(seconds) {
      return Math.round(Number(seconds || 0) * 1000);
    },
    msToSeconds(milliseconds) {
      return Number(milliseconds || 0) / 1000;
    },
    clampNumber(value, minimum, maximum) {
      return Math.min(Math.max(value, minimum), maximum);
    },
    createId(prefix) {
      const randomId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);

      return prefix ? prefix + ':' + randomId : randomId;
    },
    safeParseJson(input) {
      if (typeof input !== 'string' || !input.trim()) {
        return null;
      }

      try {
        return JSON.parse(input);
      } catch (error) {
        return null;
      }
    },
    normalizeVideoIdentity(input) {
      if (!input || typeof input !== 'object') {
        return null;
      }

      const bvid = typeof input.bvid === 'string' ? input.bvid.trim() : '';
      if (!bvid) {
        return null;
      }

      const cid = typeof input.cid === 'string' ? input.cid.trim() : '';
      const epId = typeof input.epId === 'string' ? input.epId.trim() : '';

      return {
        bvid: bvid,
        cid: cid || bvid + ':p1',
        epId: epId || undefined,
      };
    },
    normalizeRemoteSegment(segment, index, identity) {
      if (!segment || typeof segment !== 'object') {
        return null;
      }

      const startMs = Number(segment.startMs);
      const endMs = Number(segment.endMs);
      if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
        return null;
      }

      const label =
        typeof segment.label === 'string' && segment.label.trim()
          ? segment.label.trim()
          : '\u63a8\u5e7f\u7247\u6bb5 ' + String(index + 1);

      return {
        id:
          typeof segment.id === 'string' && segment.id.trim()
            ? segment.id.trim()
            : (identity ? this.createVideoCacheKey(identity) : 'segment') +
              ':remote:' +
              String(index + 1),
        startMs: Math.max(0, Math.round(startMs)),
        endMs: Math.round(endMs),
        label: label,
        score: Number.isFinite(Number(segment.score)) ? Number(segment.score) : 0,
        version: Number.isFinite(Number(segment.version)) ? Number(segment.version) : 1,
        source: 'remote',
      };
    },
    normalizeLocalSegment(segment, index, identity) {
      if (!segment || typeof segment !== 'object') {
        return null;
      }

      const startMs = this.secondsToMs(segment.start);
      const endMs = this.secondsToMs(segment.end);
      if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
        return null;
      }

      const label =
        typeof segment.label === 'string' && segment.label.trim()
          ? segment.label.trim()
          : '\u672c\u5730\u63a8\u5e7f\u7247\u6bb5 ' + String(index + 1);

      return {
        id:
          (identity ? this.createVideoCacheKey(identity) : 'segment') +
          ':local:' +
          String(index + 1) +
          ':' +
          String(startMs) +
          ':' +
          String(endMs),
        startMs: startMs,
        endMs: endMs,
        label: label,
        score: 1,
        version: 1,
        source: 'local',
      };
    },
    dedupeSegments(segments) {
      const seen = new Set();
      return segments.filter((segment) => {
        if (!segment) {
          return false;
        }

        const key = [segment.startMs, segment.endMs, segment.label].join(':');
        if (seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      });
    },
    normalizeSubtitleLine(line, index) {
      if (!line || typeof line !== 'object') {
        return null;
      }

      const startMs = Number(line.startMs);
      const endMs = Number(line.endMs);
      const text = typeof line.text === 'string' ? line.text.trim() : '';
      if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs || !text) {
        return null;
      }

      return {
        lineIndex: Number.isFinite(Number(line.lineIndex)) ? Number(line.lineIndex) : index,
        startMs: Math.round(startMs),
        endMs: Math.round(endMs),
        text: text,
      };
    },
  };

  Object.defineProperty(globalScope, 'BILI_SPONSORBLOCK_SHARED', {
    value: Object.freeze(shared),
    configurable: false,
    enumerable: false,
    writable: false,
  });
})(globalThis);
