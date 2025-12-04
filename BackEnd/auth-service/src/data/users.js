const { Pool } = require('pg');
const fs = require('node:fs');

  const pool = new Pool({
  connectionString: process.env.DB_URL
});

  pool.connect()
  .then(() => console.log('Connecté à PostgreSQL avec succès'))
  .catch(err => console.error('Erreur de connexion à PostgreSQL', err));

  async function addUser(name, email, hashedPassword, role, profileData) {
    const result = await pool.query(
      `INSERT INTO users(name, email, password, role, profileData) 
       VALUES($1, $2, $3, $4, $5) 
       RETURNING id_user AS id, name, email, role, profileData AS profileData`,
      [name, email, hashedPassword, role, profileData]
    );
    return result.rows[0];
  }

  async function findIDbyemail(email) {
    try {
      const result = await pool.query(`SELECT id_user FROM users WHERE email = $1`, [email]);
      return result.rows[0]?.id_user; // Retourne directement l'ID ou undefined
    } catch (err) {
      fs.appendFileSync('../../Log.txt', new Date().toISOString() + 'Error finding user ID: ' + err + '\n');
      throw err; 
    }
  }
  
  async function findUserByEmail(email) {
    try {
      const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
      return result.rows[0] || null;;
    } catch (err) {
      fs.appendFileSync('../../Log.txt', new Date().toISOString() + 'Erreur lors de la recherche par email:', err + '\n');
      throw err; 
    }
  }

  async function findUserById(id) {
    try {
      const result = await pool.query(`SELECT * FROM users WHERE id_user = $1`, [id]);
      return result.rows[0] || null;;
    } catch (err) {
      fs.appendFileSync('../../Log.txt', new Date().toISOString() + 'Erreur lors de la recherche par ID:', err + '\n');
      throw err; 
    }
  }

async function deleteUserById(id) {
  try {
    const result = await pool.query(`DELETE FROM users WHERE id_user = $1 RETURNING *`, [id]);
    return result.rows[0] || null;
  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + 'Erreur lors de la suppression par ID:', err + '\n');
    throw err; 
  }
}

async function getAllUsers() {
  try {
    const result = await pool.query(`SELECT * FROM users`);
    return result.rows;
  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + 'Erreur lors de la récupération de tous les utilisateurs:', err + '\n');
    throw err; 
  }
}

module.exports = {  addUser, findUserByEmail, findUserById, findIDbyemail, getAllUsers, deleteUserById};
