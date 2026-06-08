import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Visitor & Click Tracking Middleware
 * Checks if the user is an admin. If so, skips tracking.
 * Otherwise, populates visitor info for route handlers or logs.
 */
const trackVisitor = async (req, res, next) => {
    try {
        // 1. Check if user is already authenticated as admin by previous auth middleware
        if (req.user && req.user.role === 'admin') {
            req.skipTracking = true;
            return next();
        }

        // 2. Decode token if present to check role
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        let userId = null;
        let role = null;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yoursecretkey');
                userId = decoded.id;
                role = decoded.role;

                // Double check user in database if role isn't populated or to confirm admin status
                if (!role || role === 'admin') {
                    const user = await User.findById(userId).select('role');
                    if (user) {
                        role = user.role;
                    }
                }
            } catch (err) {
                // If token verification fails, we treat them as guest rather than throwing error
            }
        }

        // 3. Skip tracking if user is admin
        if (role === 'admin' || req.user?.role === 'admin') {
            req.skipTracking = true;
            return next();
        }

        // 4. Attach tracking details to request
        req.visitorInfo = {
            userId: userId || (req.user ? req.user._id : null),
            isGuest: !userId && !req.user,
        };

        next();
    } catch (error) {
        console.error('Error in visitor tracking middleware:', error);
        next();
    }
};

export default trackVisitor;
