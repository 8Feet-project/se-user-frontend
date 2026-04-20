function normalizeWindow(lines, startIndex, endIndex, reason) {
  const selectedLines = lines.slice(startIndex, endIndex + 1);
  if (!selectedLines.length) {
    return null;
  }

  return {
    startLineIndex: selectedLines[0].lineIndex,
    endLineIndex: selectedLines[selectedLines.length - 1].lineIndex,
    startMs: selectedLines[0].start_ms,
    endMs: selectedLines[selectedLines.length - 1].end_ms,
    lines: selectedLines.map((line) => ({
      lineIndex: line.line_index,
      startMs: line.start_ms,
      endMs: line.end_ms,
      text: line.text,
    })),
    reason: reason,
  };
}

export function buildCandidateWindows(subtitleLines, config) {
  if (!Array.isArray(subtitleLines) || !subtitleLines.length) {
    return [];
  }

  const lines = subtitleLines
    .map((line, index) => ({
      ...line,
      line_index: Number.isFinite(Number(line.line_index)) ? Number(line.line_index) : index,
      start_ms: Number(line.start_ms),
      end_ms: Number(line.end_ms),
      text: String(line.text || ''),
    }))
    .sort((left, right) => left.start_ms - right.start_ms);

  const windows = [];
  let introEndIndex = -1;
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].end_ms <= config.rules.introScanMs) {
      introEndIndex = index;
    }
  }

  if (introEndIndex >= 0) {
    const introWindow = normalizeWindow(lines, 0, introEndIndex, 'intro_scan');
    if (introWindow && introWindow.endMs - introWindow.startMs <= config.rules.maxWindowMs) {
      windows.push(introWindow);
    }
  }

  lines.forEach((line, index) => {
    const matched = config.rules.keywords.some((keyword) => line.text.includes(keyword));
    if (!matched) {
      return;
    }

    let startIndex = Math.max(0, index - 2);
    let endIndex = Math.min(lines.length - 1, index + 2);

    while (
      endIndex < lines.length - 1 &&
      lines[endIndex].end_ms - lines[startIndex].start_ms < config.rules.maxWindowMs
    ) {
      endIndex += 1;
    }

    while (
      endIndex > startIndex &&
      lines[endIndex].end_ms - lines[startIndex].start_ms > config.rules.maxWindowMs
    ) {
      endIndex -= 1;
    }

    const keywordWindow = normalizeWindow(lines, startIndex, endIndex, 'keyword');
    if (keywordWindow) {
      windows.push(keywordWindow);
    }
  });

  return mergeWindows(windows, config.rules.mergeGapMs);
}

function mergeWindows(windows, mergeGapMs) {
  if (!windows.length) {
    return [];
  }

  const sorted = windows.slice().sort((left, right) => left.startMs - right.startMs);
  const merged = [sorted[0]];

  for (let index = 1; index < sorted.length; index += 1) {
    const next = sorted[index];
    const current = merged[merged.length - 1];
    if (next.startMs - current.endMs <= mergeGapMs) {
      current.endMs = Math.max(current.endMs, next.endMs);
      current.endLineIndex = Math.max(current.endLineIndex, next.endLineIndex);
      current.lines = dedupeLines(current.lines.concat(next.lines));
      current.reason = current.reason + '+' + next.reason;
      continue;
    }

    merged.push(next);
  }

  return merged;
}

function dedupeLines(lines) {
  const seen = new Set();
  return lines.filter((line) => {
    const key = [line.lineIndex, line.startMs, line.endMs].join(':');
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
