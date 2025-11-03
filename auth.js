// auth.js - Handles signup, login, Google Sign-In, and password reset
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const router = express.Router();

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// User Signup
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';

    db.query(query, [name, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User registered successfully' });
    });
});

// User Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    });
});

// Google Sign-In
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [profile.emails[0].value], (err, results) => {
        if (err) return done(err);
        if (results.length > 0) return done(null, results[0]);
        
        const insertQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        db.query(insertQuery, [profile.displayName, profile.emails[0].value, ''], (err, result) => {
            if (err) return done(err);
            return done(null, { id: result.insertId, name: profile.displayName, email: profile.emails[0].value });
        });
    });
}));

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/dashboard');
});

// Forgot Password
router.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `http://localhost:5000/reset-password?token=${token}`;
    res.json({ message: 'Password reset link generated', resetLink });
});

module.exports = router;
