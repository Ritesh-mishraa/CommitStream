import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getSecret = () => process.env.JWT_SECRET || 'fallback_secret_for_development_do_not_use_in_prod';

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, getSecret());
        const userId = decoded.userId || decoded.id;

        const user = await User.findById(userId).select('-passwordHash');
        if (!user) {
            return res.status(401).json({ error: 'User no longer exists' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
