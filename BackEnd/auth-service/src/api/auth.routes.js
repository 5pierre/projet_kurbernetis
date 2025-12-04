const express = require('express');
const router = express.Router();
const { registerUser, loginUser} = require('../core/auth.services');
const { findUserById, findUserByEmail, getAllUsers, deleteUserById } = require('../data/users');
const jwt = require('jsonwebtoken');
const fs = require('node:fs');
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

router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'Strict',
        secure: false // true en prod
    });
    res.status(200).json({ message: "Déconnecté" });
});


// Admin Command (Protected)

router.get('/admin/allusers', async (req, res) => {
    const token= req.cookies.token;
    console.log("Token received:", token); // Log du token reçu
    if (!token) return res.status(403).send("Access denied");
    try {
        const decoded = verifyToken(token);
        const userrole = await findUserByEmail(decoded.email)

    if (decoded.role === 'admin' && userrole.role === 'admin') {
        const users = await getAllUsers();
        res.status(200).json(users);
    } else {
        res.status(403).send("invalid credentials"); 
    }
    }catch (err) {
        fs.appendFileSync('../../Log.txt', `${new Date().toISOString()} - Error: ${err.message}\n`);
        res.status(401).send("Invalid token");
    }
});

//admin delet user byid 
router.delete('/admin/deleteuser/:id', async (req, res) => {
    const token= req.cookies.token;
    console.log("Token received:", token); // Log du token reçu
    if (!token) return res.status(403).send("Access denied");

    try {
        const decoded = verifyToken(token);
        const reqInfo = await findUserByEmail(decoded.email);
        if (decoded.role !== 'admin' && reqInfo.role !== 'admin') {
            return res.status(403).send("invalid credentials"); 
        }
        const idToDelete = Number.parseInt(req.params.id);
        if (!idToDelete) {
            return res.status(400).send("Invalid ID");
        }
        const userToDelete = await findUserById(idToDelete);
        if (!userToDelete) {
            return res.status(404).send("User not found");
        }
        if (userToDelete.role === 'admin') {
            return res.status(403).send("Cannot delete another admin");  
        }
        await deleteUserById(idToDelete);
        res.status(200).json("User deleted successfully");
        
    } catch (err) {
        fs.appendFileSync('../../Log.txt', `${new Date().toISOString()} - Error: ${err.message}\n`);
        res.status(401).send("Invalid token");
    }
});


// Get User Profile (Protected)
router.get('/users/:id', async (req, res) => {
    console.log("Fetching user profile");
    console.log("Request cookies:", req.cookies);
    console.log("Request params:", req.cookies.token);
    console.log(req);
    const token= req.cookies.token;
    console.log("Token received:", token); // Log du token reçu
    if (!token) return res.status(403).send("Access denied");

    try {
        if (!Number.isInteger(Number.parseInt(req.params.id))) {
            return res.status(400).send("Invalid  ID");
        }
        const decoded = verifyToken(token);
        const user = await findUserById(Number.parseInt(req.params.id));
        if (user && user.email === decoded.email) {
            res.status(200).json({ name: user.name, email: user.email, role: user.role });
        } else {
            res.status(404).send("invalid credentials"); 
        }
    } catch (err) {
        fs.appendFileSync('../../Log.txt', `${new Date().toISOString()} - Error: ${err.message}\n`);
        res.status(401).send("Invalid token");
    }
});

module.exports = router;
