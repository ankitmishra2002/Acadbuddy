/** True while Focus Mode route is mounted — suppresses app toasts / distractions */
let active = false;
const listeners = new Set();

export function setFocusModeActive(value) {
  active = Boolean(value);
  listeners.forEach((fn) => fn());
}

export function isFocusModeActive() {
  return active;
}

/** Re-render subscribers (e.g. toast viewport) when focus mode toggles */
export function subscribeFocusMode(onStoreChange) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}
