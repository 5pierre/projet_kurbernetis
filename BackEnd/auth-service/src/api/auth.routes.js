const express = require('express');
const router = express.Router();
const { registerUser, loginUser, loginAdmin} = require('../core/auth.services');
const { findUserById } = require('../data/users');
const jwt = require('jsonwebtoken');
const Key = process.env.JWT_SECRET;

const verifyToken = (token) => {
    const parts = token.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") throw new Error("Bad token format");
    return jwt.verify(parts[1], Key);
};

router.post('/admin', loginAdmin );

// Register
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Get User Profile (Protected)
router.get('/users/:id', async (req, res) => {
    const token = req.headers.authorization;
    if (!token) return res.status(403).send("Access denied");

    try {
        const decoded = verifyToken(token);
        const user = await findUserById(parseInt(req.params.id));
        if (user && user.email === decoded.email) {
            res.status(200).json({ name: user.name, email: user.email, role: user.role });
        } else {
            res.status(404).send("User not found");
        }
    } catch (err) {
        console.error("Token error:", err.message);
        res.status(401).send("Invalid token");
    }
});

module.exports = router;
