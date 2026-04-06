import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

const configurePassport = () => {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
        console.warn('GitHub OAuth credentials missing in .env. Passport routing will crash if triggered.');
        return;
    }

    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV === 'production' 
            ? `${process.env.RENDER_EXTERNAL_URL}/api/auth/github/callback` 
            : (process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/api/auth/github/callback"),
        scope: ['user:email', 'repo']
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user exists via unique githubId
            let user = await User.findOne({ githubId: String(profile.id) });

            if (user) {
                // Update tokens/avatars silently
                user.avatarUrl = profile.photos?.[0]?.value || user.avatarUrl;
                user.githubAccessToken = accessToken;
                user.username = profile.username;
                await user.save();
                return done(null, user);
            }

            // Determine fallback email
            const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
            
            // Check if user exists in the Legacy Mongoose Schema by username or email
            let legacyUser = await User.findOne({ 
                $or: [{ email }, { username: profile.username }] 
            });

            if (legacyUser) {
                // Instantly merge and promote their legacy account to an integrated GitHub Passport Identity
                legacyUser.githubId = String(profile.id);
                legacyUser.avatarUrl = profile.photos?.[0]?.value || '';
                legacyUser.githubAccessToken = accessToken;
                await legacyUser.save();
                return done(null, legacyUser);
            }

            // Finally, cleanly create new onboarded user from GitHub payload
            user = await User.create({
                githubId: String(profile.id),
                username: profile.username,
                email: email,
                avatarUrl: profile.photos?.[0]?.value || '',
                githubAccessToken: accessToken
            });

            return done(null, user);
        } catch (err) {
            console.error('Passport GitHub Authentication Strategy Error:', err);
            return done(err, null);
        }
    }));
};

export default configurePassport;
