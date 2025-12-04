const { getStories, createStory } = require('../data/story');
const fs = require('node:fs');
const jwt = require('jsonwebtoken');
const Key = process.env.JWT_SECRET;



const verifyToken = (token) => {
    if (!token) throw new Error("No token provided");
    const parts = token.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") throw new Error("Bad token format"); 
    return jwt.verify(parts[1], Key);
};



// GET ALL STORIES
async function getAllStories(req, res) {
  try {
    const stories = await getStories();
    
    if (!stories || stories.length === 0) {
      return res.status(200).json({ message: "No stories found", stories: [] });
    }

    res.status(200).json({ stories });
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Stories fetched successfully\n");

  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Error fetching stories: " + err + "\n");
    res.status(500).json({ error: "Internal error while fetching stories" });
  }
}

// CREATE STORY
async function createNewStory(req, res) {

  console.log("create story");
  console.log(req);
  console.log("Request cookies:", req.cookies);
  console.log("Request params:", req.cookies.token);

const token = req.headers.authorization;
if (!token) return res.status(403).send("Access denied");
  try {
    const { content } = req.body;
    console.log("Received story content:", content);
    console.log(": ", req);
    const decodedToken = verifyToken(token);

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ error: "Story content is required and must be a non-empty string" });
      }

      if (content.length > 5000) {
        return res.status(400).json({ error: "Story is too long (max 5000 characters)" });
      }

      if (content.length < 10) {
        return res.status(400).json({ error: "Story is too short (min 10 characters)" });
      }
      const id_user = decodedToken.id;
      const newStory = await createStory(id_user, content);

      res.status(201).json({
        message: "Story created successfully",
        story: newStory
      });
      fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Story created successfully by user " + id_user + "\n");

    } catch (err) {
      fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Error creating story: " + err + "\n");
      res.status(500).json({ error: "Internal error while creating story" });
    }
}

module.exports = { getAllStories, createNewStory };