const express = require('express');
const router = express.Router();
const { registerUser, loginUser} = require('../core/auth.services');
const { findUserById } = require('../data/users');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const Key = process.env.JWT_SECRET;

// BRUT FORCE PROTECTION (attention blocaqge IP)
const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // Limite: 10 tentative
    message: { error: "Trop de tentatives. Veuillez réessayer dans 10 minutes." },
    standardHeaders: true, 
    legacyHeaders: false, 
});

const verifyToken = (token) => {
    if (!token) throw new Error("No token provided");
    const parts = token.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") throw new Error("Bad token format"); 
    return jwt.verify(parts[1], Key);
};

router.post('/register', registerUser);
router.post('/login', loginLimiter, loginUser);
// /admin for ?

// Get User Profile (Protected)
router.get('/users/:id', async (req, res) => {
    const token = req.headers.authorization;
    if (!token) return res.status(403).send("Access denied");

    try {
        if (!Number.isInteger(parseInt(req.params.id))) {
            return res.status(400).send("Invalid  ID");
        }
        const decoded = verifyToken(token);
        const user = await findUserById(parseInt(req.params.id));
        if (user && user.email === decoded.email) {
            res.status(200).json({ name: user.name, email: user.email, role: user.role });
        } else {
            res.status(404).send("invalid credentials"); 
        }
    } catch (err) {
        fs.appendFile('../../Log.txt', `${new Date().toISOString()} - Error: ${err.message}\n`);
        res.status(401).send("Invalid token");
    }
});

module.exports = router;
