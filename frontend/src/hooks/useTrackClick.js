import { useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getOrCreateGuestId } from '../utils/guestId';

/**
 * Hook to track button clicks and tap actions silently.
 * Returns a trackClick function to trigger on events.
 * Skips tracking if user is logged in as an admin.
 */
const useTrackClick = () => {
  const location = useLocation();
  const { userInfo } = useContext(AuthContext);

  const trackClick = useCallback(async (buttonName) => {
    // Exclude admins from tracking
    if (userInfo?.role === 'admin') {
      return;
    }

    try {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      const guestId = getOrCreateGuestId();
      const token = userInfo?.token;

      const res = await fetch(`${API_BASE}/api/track-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          page: location.pathname + location.search,
          guestId,
          buttonName,
        }),
      });

      if (!res.ok) {
        console.debug('Click tracking returned non-200 status');
      }
    } catch (err) {
      // Fail silently in production
      console.error('Click tracking failed:', err);
    }
  }, [location.pathname, location.search, userInfo]);

  return trackClick;
};

export default useTrackClick;
