export function calculateIoU(left, right) {
  const intersection = Math.max(0, Math.min(left.end_ms, right.end_ms) - Math.max(left.start_ms, right.start_ms));
  const union = Math.max(left.end_ms, right.end_ms) - Math.min(left.start_ms, right.start_ms);
  if (!union) {
    return 0;
  }

  return intersection / union;
}

export function derivePublishedSegments({ aiProposals, manualProposals, feedback, existingPublished }) {
  const publishable = [];

  aiProposals.forEach((proposal) => {
    const confirms = countUniqueActors(
      feedback.filter((item) => item.action === 'confirm' && item.segment_id === proposal.id)
    );
    const rejects = countUniqueActors(
      feedback.filter((item) => item.action === 'not_ad' && item.segment_id === proposal.id)
    );

    if (proposal.confidence >= 0.92 && confirms >= 1 && rejects < 2) {
      publishable.push({
        start_ms: proposal.start_ms,
        end_ms: proposal.end_ms,
        label: proposal.label,
        score: Number(proposal.confidence || 0),
        derived_from_json: [{ proposalId: proposal.id, source: proposal.source }],
      });
    }
  });

  for (let index = 0; index < manualProposals.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < manualProposals.length; otherIndex += 1) {
      const left = manualProposals[index];
      const right = manualProposals[otherIndex];
      const leftActor = left.created_by_user_id || left.created_by_device_id;
      const rightActor = right.created_by_user_id || right.created_by_device_id;

      if (!leftActor || !rightActor || leftActor === rightActor) {
        continue;
      }

      if (calculateIoU(left, right) < 0.8) {
        continue;
      }

      publishable.push({
        start_ms: Math.round((left.start_ms + right.start_ms) / 2),
        end_ms: Math.round((left.end_ms + right.end_ms) / 2),
        label: left.label || right.label || 'manual sponsor segment',
        score: 1,
        derived_from_json: [
          { proposalId: left.id, source: left.source },
          { proposalId: right.id, source: right.source },
        ],
      });
    }
  }

  existingPublished.forEach((segment) => {
    const rejects = countUniqueActors(
      feedback.filter((item) => item.action === 'not_ad' && item.segment_id === segment.id)
    );

    if (rejects < 2) {
      publishable.push({
        start_ms: segment.start_ms,
        end_ms: segment.end_ms,
        label: segment.label,
        score: Number(segment.score || 0),
        derived_from_json: segment.derived_from_json || [],
      });
    }
  });

  return mergeAdjacentSegments(dedupeSegments(publishable), 1500);
}

function countUniqueActors(items) {
  return new Set(
    items.map((item) => item.actor_user_id || item.actor_device_id).filter(Boolean)
  ).size;
}

function dedupeSegments(segments) {
  const seen = new Set();
  return segments.filter((segment) => {
    const key = [segment.start_ms, segment.end_ms, segment.label].join(':');
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function mergeAdjacentSegments(segments, maxGapMs) {
  if (!segments.length) {
    return [];
  }

  const sorted = segments.slice().sort((left, right) => left.start_ms - right.start_ms);
  const merged = [sorted[0]];

  for (let index = 1; index < sorted.length; index += 1) {
    const next = sorted[index];
    const current = merged[merged.length - 1];
    if (next.start_ms - current.end_ms < maxGapMs) {
      current.end_ms = Math.max(current.end_ms, next.end_ms);
      current.score = Math.max(Number(current.score || 0), Number(next.score || 0));
      current.derived_from_json = []
        .concat(current.derived_from_json || [])
        .concat(next.derived_from_json || []);
      continue;
    }

    merged.push(next);
  }

  return merged;
}
