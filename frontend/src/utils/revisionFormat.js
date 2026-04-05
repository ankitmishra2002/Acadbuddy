/** Normalize revision-sheet definition entries (string "Term: def" or { term, definition }). */
export function formatRevisionDefinition(def) {
  if (def == null) return { term: 'Definition', body: '' };
  if (typeof def === 'string') {
    const idx = def.indexOf(':');
    if (idx > 0 && idx < 120) {
      return { term: def.slice(0, idx).trim(), body: def.slice(idx + 1).trim() };
    }
    return { term: 'Definition', body: def.trim() };
  }
  return {
    term: def.term != null ? String(def.term) : 'Term',
    body: def.definition != null ? String(def.definition) : String(def.text || '')
  };
}
