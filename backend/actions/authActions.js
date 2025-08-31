const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleIdToken(idToken) {
    if (!idToken) throw new Error('idToken required');
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    return ticket.getPayload();
}

async function findOrCreateUserFromPayload(payload) {
    const { sub: googleId, email, name, picture } = payload;
    let user = await User.findOne({ googleId });
    if (!user) {
        user = await User.create({ googleId, email, name, picture });
    }
    return user;
}

function signAccessToken(user) {
    return jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        subject: user._id.toString(),
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
}

function signRefreshToken(user) {
    return jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        subject: user._id.toString(),
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
    });
}

async function exchangeIdTokenForTokens(idToken) {
    const payload = await verifyGoogleIdToken(idToken);
    const user = await findOrCreateUserFromPayload(payload);
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    
    // Clean up old refresh tokens for this user before creating new one
    try {
        await RefreshToken.deleteMany({ user: user._id });
        
        const decoded = jwt.decode(refreshToken);
        const expiresAt = decoded ? new Date(decoded.exp * 1000) : null;
        await RefreshToken.create({ token: refreshToken, user: user._id, expiresAt });
    } catch (err) {
        console.error('Failed to persist refresh token', err);
    }
    return { accessToken, refreshToken, user };
}

async function refreshAccessToken(refreshToken) {
    if (!refreshToken) throw new Error('refreshToken required');
    // verify token signature and expiry
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const userId = payload.sub;
    // ensure token exists in DB (not revoked)
    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored) throw new Error('Refresh token revoked or not found');
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    const accessToken = signAccessToken(user);
    return accessToken;
}

async function revokeRefreshToken(refreshToken) {
    if (!refreshToken) throw new Error('refreshToken required');
    await RefreshToken.deleteOne({ token: refreshToken });
}

async function getProfileFromAccessToken(accessToken) {
    if (!accessToken) throw new Error('accessToken required');
    const payload = jwt.verify(accessToken, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('-__v');
    if (!user) throw new Error('User not found');
    return user;
}

async function cleanupExpiredTokens() {
    try {
        const result = await RefreshToken.deleteMany({ 
            expiresAt: { $lt: new Date() } 
        });
        console.log(`Cleaned up ${result.deletedCount} expired refresh tokens`);
        return result.deletedCount;
    } catch (err) {
        console.error('Failed to cleanup expired tokens', err);
        return 0;
    }
}

module.exports = {
    verifyGoogleIdToken,
    findOrCreateUserFromPayload,
    signAccessToken,
    signRefreshToken,
    exchangeIdTokenForTokens,
    refreshAccessToken,
    revokeRefreshToken,
    getProfileFromAccessToken,
    cleanupExpiredTokens,
};
