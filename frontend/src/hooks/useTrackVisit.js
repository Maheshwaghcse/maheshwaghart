import { useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getOrCreateGuestId } from '../utils/guestId';

/**
 * Hook to track page visits silently.
 * Skips tracking if the user is logged in as an admin.
 */
const useTrackVisit = () => {
  const location = useLocation();
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    // Exclude admins from tracking
    if (userInfo?.role === 'admin') {
      return;
    }

    const trackVisit = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || '';
        const guestId = getOrCreateGuestId();
        const token = userInfo?.token;

        const res = await fetch(`${API_BASE}/api/track-visit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            page: location.pathname + location.search,
            guestId,
          }),
        });
        
        if (!res.ok) {
          console.debug('Visitor tracking returned non-200 status');
        }
      } catch (err) {
        // Fail silently in production
        console.error('Visitor tracking failed:', err);
      }
    };

    trackVisit();
  }, [location.pathname, location.search, userInfo]);
};

export default useTrackVisit;
