/**
 * Normalize slide shape from API: prefers bullets; falls back to legacy "content" / "notes" fields.
 */
export function resolveSlideBullets(slide) {
  if (!slide) return [];
  let bullets = slide.bullets;
  if (Array.isArray(bullets)) {
    bullets = bullets.map((b) => String(b).trim()).filter(Boolean);
    if (bullets.length) return bullets;
  }
  const c = typeof slide.content === 'string' ? slide.content.trim() : '';
  if (!c) return [];
  const lines = c
    .split(/\n+/)
    .map((line) => line.replace(/^[-•*\d.)]+\s*/, '').trim())
    .filter((line) => line.length > 3);
  if (lines.length > 0) return lines;
  const sentences = c
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
  if (sentences.length > 0) return sentences.slice(0, 8);
  return [c];
}

export function resolveSpeakerNotes(slide) {
  if (!slide) return '';
  const n = slide.speakerNotes ?? slide.notes;
  return typeof n === 'string' ? n.trim() : '';
}
