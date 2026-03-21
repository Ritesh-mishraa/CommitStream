import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const getSecret = () => process.env.JWT_SECRET || 'fallback_secret_for_development_do_not_use_in_prod';

// Initiate GitHub OAuth flow
router.get('/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));

// GitHub OAuth callback route
router.get('/github/callback', 
    passport.authenticate('github', { failureRedirect: 'http://localhost:5173/auth?error=oauth_failed' }),
    (req, res) => {
        // Issue secure frontend token tied directly to the OAuth validated user ID
        const token = jwt.sign(
            { id: req.user._id, username: req.user.username },
            getSecret(),
            { expiresIn: '7d' }
        );

        // Subtly inject the token into a URL query parameter for the React router to absorb instantly
        res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
    }
);

// Get current authenticated user
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-githubAccessToken');
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        const userObj = user.toObject();
        userObj.hasGithubPat = !!user.githubAccessToken; // Use dynamic passport token proxy to satisfy frontend UX requirements
        
        res.json(userObj);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/register', (req, res) => res.status(410).json({ error: 'Manual registration deprecated. Use /github' }));
router.post('/login', (req, res) => res.status(410).json({ error: 'Manual login deprecated. Use /github' }));

export default router;
