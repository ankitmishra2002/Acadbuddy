import User from '../models/User.model.js';

export const requireAdmin = async (req, res, next) => {
    try {
        // req.userId should be populated by authenticateAccessToken First
        if (!req.userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admin privileges required' });
        }

        // Pass the full user object to the next handler if needed
        req.adminUser = user;
        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(500).json({ message: 'Server error verifying admin privileges' });
    }
};
