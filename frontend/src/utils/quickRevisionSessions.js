const KEY = 'acadbuddy_quick_rvsn_sessions_v1';
const MAX = 14;

export function loadQuickRevisionSessions() {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function pushQuickRevisionSession(entry) {
  try {
    const prev = loadQuickRevisionSessions();
    const next = [
      {
        id: entry.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        topicPreview: entry.topicPreview || '',
        questionCount: entry.questionCount,
        createdAt: entry.createdAt || new Date().toISOString(),
        summaryPreview: entry.summaryPreview || '',
      },
      ...prev.filter((x) => x.id !== entry.id),
    ].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('acadbuddy-quick-rvsn'));
  } catch (e) {
    console.warn('pushQuickRevisionSession', e);
  }
}
