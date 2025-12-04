const express = require('express');
const router = express.Router();
const { getAllStories, createNewStory } = require('../core/story.services');


router.get('/stories', getAllStories);
router.post('/stories', createNewStory);



module.exports = router;
