import Visitor from '../models/Visitor.js';
import User from '../models/User.js';
import CustomRequest from '../models/CustomRequest.js';

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
        const { days } = req.query;

        // Build date filter based on time slicer
        let dateFilter = {};
        if (days && days !== 'all') {
            const daysNum = parseInt(days, 10);
            if (!isNaN(daysNum)) {
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - daysNum);
                dateFilter = { visitedAt: { $gte: cutoff } };
            }
        }

        // 1. Visit Stats within filtered window
        const totalVisits = await Visitor.countDocuments({ ...dateFilter, action: 'visit' });
        const loggedInVisits = await Visitor.countDocuments({ ...dateFilter, action: 'visit', isGuest: false });
        const guestVisits = await Visitor.countDocuments({ ...dateFilter, action: 'visit', isGuest: true });

        // 2. User Accounts Count (Independent of dateFilter so admin sees total, or can filter by date if desired, but total is better)
        const totalUsers = await User.countDocuments();

        // 3. Active Users (logged in within last 30 minutes)
        const activeCutoff = new Date(Date.now() - 30 * 60 * 1000);
        const activeUsersCount = (await Visitor.distinct('userId', {
            userId: { $ne: null },
            visitedAt: { $gte: activeCutoff }
        })).length;

        // 4. Action Event Counts (filtered by date window)
        const totalLogins = await Visitor.countDocuments({ ...dateFilter, action: 'login' });
        const totalRegisters = await Visitor.countDocuments({ ...dateFilter, action: 'register' });
        const totalCustomRequests = await CustomRequest.countDocuments(dateFilter);

        // 5. Clicks grouped by action
        const clickCounts = await Visitor.aggregate([
            { 
                $match: { 
                    ...dateFilter, 
                    action: { $nin: ['visit', 'login', 'register', 'custom_request'] } 
                } 
            },
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const formattedClicks = clickCounts.map(item => ({
            name: item._id,
            count: item.count
        }));

        // 6. Recent visits/actions (last 100)
        const recentVisits = await Visitor.find(dateFilter)
            .sort({ visitedAt: -1 })
            .limit(100)
            .populate('userId', 'name email uid');

        // 7. Historical Chart Data (daily visits/actions in the filtered range)
        let chartDays = 7;
        if (days && days !== 'all') {
            const parsedDays = parseInt(days, 10);
            if (!isNaN(parsedDays)) chartDays = parsedDays;
        } else if (days === 'all') {
            chartDays = 30; // default to 30 days for chart if all time
        }

        const chartData = [];
        for (let i = chartDays - 1; i >= 0; i--) {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            start.setDate(start.getDate() - i);

            const end = new Date();
            end.setHours(23, 59, 59, 999);
            end.setDate(end.getDate() - i);

            const visitsCount = await Visitor.countDocuments({
                action: 'visit',
                visitedAt: { $gte: start, $lte: end }
            });

            const actionCount = await Visitor.countDocuments({
                action: { $ne: 'visit' },
                visitedAt: { $gte: start, $lte: end }
            });

            chartData.push({
                date: start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                visits: visitsCount,
                actions: actionCount
            });
        }

        return res.status(200).json({
            totalVisits,
            loggedInVisits,
            guestVisits,
            totalUsers,
            activeUsers: activeUsersCount,
            totalLogins,
            totalRegisters,
            totalCustomRequests,
            clickCounts: formattedClicks,
            recentVisits,
            chartData
        });
    } catch (error) {
        console.error('Error in getAdminStats controller:', error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Retrieve all registered users with activity stats
 * GET /api/admin/users
 */
export const getAdminUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        
        // 1. Assign UIDs sequentially to any legacy users missing them (avoids race condition/duplicate key errors in Promise.all)
        for (const u of users) {
            if (!u.uid) {
                const count = await User.countDocuments({ uid: { $exists: true } });
                u.uid = `U-${String(count + 1).padStart(3, '0')}`;
                try {
                    await u.save();
                } catch (saveErr) {
                    // In case of any concurrent collision/duplicate, fetch updated count and retry once
                    console.error(`Collision/error saving UID U-${count + 1} for ${u.email}:`, saveErr.message);
                    const freshCount = await User.countDocuments({ uid: { $exists: true } });
                    u.uid = `U-${String(freshCount + 1).padStart(3, '0')}`;
                    await u.save();
                }
            }
        }

        // 2. Fetch visitor analytics stats for all users concurrently
        const usersWithStats = await Promise.all(users.map(async (u) => {
            const totalActions = await Visitor.countDocuments({ userId: u._id });
            const lastAction = await Visitor.findOne({ userId: u._id }).sort({ visitedAt: -1 });

            return {
                _id: u._id,
                uid: u.uid,
                name: u.name,
                email: u.email,
                role: u.role,
                phone: u.phone,
                address: u.address,
                createdAt: u.createdAt,
                totalActions,
                lastActive: lastAction ? lastAction.visitedAt : null
            };
        }));

        return res.status(200).json(usersWithStats);
    } catch (error) {
        console.error('Error in getAdminUsers controller:', error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Retrieve insights for a single user (detailed activity log)
 * GET /api/admin/users/:id/insight
 */
export const getUserInsight = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const activities = await Visitor.find({ userId })
            .sort({ visitedAt: -1 })
            .limit(100);

        return res.status(200).json({
            user,
            activities
        });
    } catch (error) {
        console.error('Error in getUserInsight controller:', error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Retrieve all custom requests
 * GET /api/admin/custom-requests
 */
export const getAdminCustomRequests = async (req, res) => {
    try {
        const requests = await CustomRequest.find().sort({ createdAt: -1 });
        return res.status(200).json(requests);
    } catch (error) {
        console.error('Error in getAdminCustomRequests controller:', error);
        return res.status(500).json({ message: error.message });
    }
};
