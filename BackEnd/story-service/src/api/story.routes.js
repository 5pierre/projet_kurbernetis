const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const Key = process.env.JWT_SECRET;
const { getStories, createStory } = require('../data/story');
const { getAllStories, createNewStory } = require('../core/story.services');

const verifyToken = (token) => {
    if (!token) throw new Error("No token provided");
    const parts = token.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") throw new Error("Bad token format"); 
    return jwt.verify(parts[1], Key);
};

router.get('/stories', getAllStories);
router.post('/stories', verifyToken, createNewStory);

// router.get('/stories', async (req, res) => {
//    try {
//         const stories = await getStories(); 
//         res.status(200).json(stories);

//     } catch (err) {
//         fs.appendFile('../../Log.txt', `${new Date().toISOString()} - Error fetching stories: ${err.message}\n`, () => {});
//         res.status(500).send({ message: "Internal server error while fetching stories." });
//     }
// });


// router.post('/stories', async (req, res) => {
//     const { content } = req.body;
//     const token = req.headers.authorization;
//     if (!token) return res.status(403).send("Access denied");

//     if (!content || typeof content !== 'string' || content.trim().length === 0) {
//         return res.status(400).send({ message: "Story content is required and must be a non-empty string." });
//     }
    
//     if (content.length > 5000) {
//          return res.status(400).send({ message: "Story is too long (max 5000 characters)." });
//     }

//     try {
//         const decoded = verifyToken(token);
//         const id_user = req.user.id_user;
//         const newStory = await createStory(id_user, content);
        
//         res.status(201).json({ 
//             message: "Story created successfully.", 
//             story: newStory
//         });

//     } catch (err) {
//         fs.appendFile('../../Log.txt', `${new Date().toISOString()} - Error creating story: ${err.message}\n`, () => {});
//         res.status(500).send({ message: "Internal server error while creating story." });
//     }
// });

module.exports = router;
