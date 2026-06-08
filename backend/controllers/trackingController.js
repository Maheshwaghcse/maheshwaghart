import Visitor from '../models/Visitor.js';

/**
 * Track a page visit
 * POST /api/track-visit
 */
export const trackVisit = async (req, res) => {
    try {
        if (req.skipTracking) {
            return res.status(200).json({ success: true, message: 'Admin visit skipped' });
        }

        const { page, guestId } = req.body;
        const userId = req.visitorInfo?.userId || null;
        const isGuest = req.visitorInfo?.isGuest ?? true;

        const visitor = new Visitor({
            userId,
            guestId,
            isGuest,
            action: 'visit',
            page: page || '/',
            ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown',
        });

        await visitor.save();
        return res.status(201).json({ success: true, message: 'Visit tracked successfully' });
    } catch (error) {
        console.error('Error in trackVisit controller:', error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Track a button click or element tap
 * POST /api/track-click
 */
export const trackClick = async (req, res) => {
    try {
        if (req.skipTracking) {
            return res.status(200).json({ success: true, message: 'Admin click skipped' });
        }

        const { page, guestId, buttonName } = req.body;
        const userId = req.visitorInfo?.userId || null;
        const isGuest = req.visitorInfo?.isGuest ?? true;

        const visitor = new Visitor({
            userId,
            guestId,
            isGuest,
            action: buttonName || 'click',
            page: page || '/',
            ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown',
        });

        await visitor.save();
        return res.status(201).json({ success: true, message: 'Click tracked successfully' });
    } catch (error) {
        console.error('Error in trackClick controller:', error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Retrieve tracking stats for Admin Dashboard
 * GET /api/admin/stats
 */
export const getAdminStats = async (req, res) => {
    try {
        // 1. Total page visits
        const totalVisits = await Visitor.countDocuments({ action: 'visit' });

        // 2. Logged-in user page visits
        const loggedInVisits = await Visitor.countDocuments({ action: 'visit', isGuest: false });

        // 3. Guest page visits
        const guestVisits = await Visitor.countDocuments({ action: 'visit', isGuest: true });

        // 4. Unique users (based on distinct user ID, excluding guests)
        const uniqueUsers = (await Visitor.distinct('userId', { isGuest: false, userId: { $ne: null } })).length;

        // 5. Unique guests (based on distinct guest ID)
        const uniqueGuests = (await Visitor.distinct('guestId', { isGuest: true, guestId: { $ne: null } })).length;

        // 6. Clicks grouped by action
        const clickCounts = await Visitor.aggregate([
            { $match: { action: { $ne: 'visit' } } },
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const formattedClicks = clickCounts.map(item => ({
            name: item._id,
            count: item.count
        }));

        // 7. Recent visits (last 10)
        const recentVisits = await Visitor.find()
            .sort({ visitedAt: -1 })
            .limit(10)
            .populate('userId', 'name email');

        return res.status(200).json({
            totalVisits,
            loggedInVisits,
            guestVisits,
            uniqueUsers,
            uniqueGuests,
            clickCounts: formattedClicks,
            recentVisits
        });
    } catch (error) {
        console.error('Error in getAdminStats controller:', error);
        return res.status(500).json({ message: error.message });
    }
};
