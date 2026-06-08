/**
 * Helper utility to get or generate a unique visitor guest ID.
 * Generates a standard UUID and persists it in localStorage.
 */
export const getOrCreateGuestId = () => {
  if (typeof window === 'undefined') return '';

  let guestId = localStorage.getItem('guestId');
  if (!guestId) {
    // Attempt standard crypto.randomUUID
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      guestId = crypto.randomUUID();
    } else {
      // Robust RFC4122 v4 compliant UUID generator fallback
      guestId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
    localStorage.setItem('guestId', guestId);
  }
  return guestId;
};
