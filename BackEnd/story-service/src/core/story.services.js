const { getStories, createStory } = require('../data/story');
const fs = require('fs');

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
  try {
    const { content } = req.body;
    const id_user = req.user.id_user;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: "Story content is required and must be a non-empty string" });
    }

    if (content.length > 5000) {
      return res.status(400).json({ error: "Story is too long (max 5000 characters)" });
    }

    if (content.length < 10) {
      return res.status(400).json({ error: "Story is too short (min 10 characters)" });
    }

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