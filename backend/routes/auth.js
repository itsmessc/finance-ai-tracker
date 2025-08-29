const express = require('express');
const router = express.Router();
const actions = require('../actions/authActions');

// POST /auth/google
router.post('/google', async (req, res) => {
    const { idToken } = req.body;
    try {
        const { accessToken, refreshToken, user } = await actions.exchangeIdTokenForTokens(idToken);
        res.json({ accessToken, refreshToken, user: { id: user._id, email: user.email, name: user.name, picture: user.picture } });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message || 'Authentication failed' });
    }
});

// POST /auth/refresh
router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    try {
        const accessToken = await actions.refreshAccessToken(refreshToken);
        res.json({ accessToken });
    } catch (err) {
        res.status(401).json({ message: err.message || 'Invalid refresh token' });
    }
});

// POST /auth/logout
router.post('/logout', async (req, res) => {
    const { refreshToken } = req.body;
    try {
        if (refreshToken) await actions.revokeRefreshToken(refreshToken);
        res.json({ message: 'Logged out' });
    } catch (err) {
        console.error('Logout error', err);
        res.status(500).json({ message: 'Failed to logout' });
    }
});

// Example protected route
router.get('/protected', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' });
    const token = authHeader.split(' ')[1];
    try {
        const user = await actions.getProfileFromAccessToken(token);
        res.json({ message: 'Protected content', user });
    } catch (err) {
        res.status(401).json({ message: err.message || 'Invalid token' });
    }
});

// GET /auth/profile
router.get('/profile', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' });
    const token = authHeader.split(' ')[1];
    try {
        const user = await actions.getProfileFromAccessToken(token);
        res.json({ user });
    } catch (err) {
        res.status(401).json({ message: err.message || 'Invalid token' });
    }
});

module.exports = router;
