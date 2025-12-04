const { Pool } = require('pg');
const fs = require('node:fs');

const pool = new Pool({
  connectionString: process.env.DB_URL
});

pool.connect()
  .then(() => console.log('Connecté à PostgreSQL avec succès'))
  .catch(err => console.error('Erreur de connexion à PostgreSQL', err));

async function getStories() {
  try {
    const result = await pool.query(
      `SELECT s.id_story, s.content, s.created_at, s.id_user, u.name AS author_name 
       FROM stories s 
       JOIN users u ON s.id_user = u.id_user 
       ORDER BY s.created_at DESC`
    );
    return result.rows;
  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + ' Error fetching stories: ' + err + '\n');
    throw err;
  }
}

async function createStory(id_user, content) {
  try {
    const result = await pool.query(
      `INSERT INTO stories(id_user, content, created_at) 
       VALUES($1, $2, NOW()) 
       RETURNING id_story, id_user, content, created_at`,
      [id_user, content ]
    );
    return result.rows[0];
  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + ' Error inserting story: ' + err + '\n');
    throw err;
  }
}

module.exports = { getStories, createStory };