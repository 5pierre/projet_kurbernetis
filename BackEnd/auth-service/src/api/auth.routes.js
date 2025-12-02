const express = require('express');
const router = express.Router();
const { registerUser, loginUser} = require('../core/auth.services');
const { findUserById, findUserByEmail, getAllUsers, deleteUserById } = require('../data/users');
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



// Admin Command (Protected)

router.get('/admin/allusers', async (req, res) => {
    const token = req.headers.authorization;
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
    const token = req.headers.authorization;
    if (!token) return res.status(403).send("Access denied");

    try {
     const decoded = verifyToken(token);
        
        // 1. D'ABORD : Qui demande ?
        const requesterInfo = await findUserByEmail(decoded.email);
        // 2. SÉCURITÉ IMMÉDIATE : Vérification du Rôle
        // On vérifie le token ET la base de données. 
        // Si pas admin, on arrête tout de suite. Aucun accès à la suite du code.
        // (Section 3.2)
        if (decoded.role !== 'admin' || requesterInfo.role !== 'admin') {
            return res.status(403).send("invalid credentials"); 
        }
        // 3. Validation de l'entrée (ID)
        const idToDelete = parseInt(req.params.id);
        if (!idToDelete) {
            return res.status(400).send("Invalid ID");
        }
        // 4. ENSUITE SEULEMENT : On va chercher la cible
        // Maintenant, on sait que c'est un admin qui demande, donc il a le droit de savoir si l'user existe.
        const userToDelete = await findUserById(idToDelete);
        if (!userToDelete) {
            return res.status(404).send("User not found");
        }
        // 5. Règle métier : Un admin ne mange pas un autre admin
        if (userToDelete.role === 'admin') {
            return res.status(403).send("Cannot delete another admin");  
        }
        // 6. Action
        await deleteUserById(idToDelete);
        res.status(200).json("User deleted successfully");
        

    } catch (err) {
        fs.appendFileSync('../../Log.txt', `${new Date().toISOString()} - Error: ${err.message}\n`);
        res.status(401).send("Invalid token");
    }
});


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
        fs.appendFileSync('../../Log.txt', `${new Date().toISOString()} - Error: ${err.message}\n`);
        res.status(401).send("Invalid token");
    }
});

module.exports = router;
