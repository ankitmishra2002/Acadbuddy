const STORAGE_KEY = 'acadbuddy_recent_features_v1';
const MAX_ITEMS = 14;

/**
 * Records a feature / area of the app the user visited (dedupes by `id`, keeps newest first).
 */
export function recordFeatureVisit({ id, label, path }) {
  if (!id || !label) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list = [];
    try {
      list = raw ? JSON.parse(raw) : [];
    } catch {
      list = [];
    }
    if (!Array.isArray(list)) list = [];
    const next = list.filter((x) => x && x.id !== id);
    next.unshift({
      id,
      label: String(label),
      path: path || '/dashboard',
      at: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, MAX_ITEMS)));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('acadbuddy-activity'));
    }
  } catch (e) {
    console.warn('recordFeatureVisit', e);
  }
}

export function getRecentFeatures() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = JSON.parse(raw || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
