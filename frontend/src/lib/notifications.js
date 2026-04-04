let listeners = new Set();
let toastId = 0;

export const subscribeNotifications = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const notify = ({
  type = 'info',
  title,
  message,
  duration = 4200,
}) => {
  const toast = {
    id: ++toastId,
    type,
    title: title || (type === 'error' ? 'Action failed' : type === 'success' ? 'Success' : 'Notice'),
    message: message || '',
    duration,
  };

  listeners.forEach((listener) => listener(toast));
  return toast.id;
};

export const notifySuccess = (message, title = 'Success') => notify({ type: 'success', title, message });
export const notifyError = (message, title = 'Something went wrong') => notify({ type: 'error', title, message });
export const notifyInfo = (message, title = 'Notice') => notify({ type: 'info', title, message });
export const notifyWarning = (message, title = 'Heads up') => notify({ type: 'warning', title, message });