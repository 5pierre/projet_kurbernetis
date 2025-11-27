const { Pool } = require('pg');


//   const pool = new Pool({
//     user: process.env.DB_USER || 'postgres',
//     host: process.env.DB_HOST || 'localhost',
//     database: process.env.DB_NAME || 'event_booking',
//     password: process.env.DB_PASSWORD || 'postgrestest',
//     port: process.env.DB_PORT || 5432
//   });

  // const pool = new Pool({
  //   user: process.env.DB_USER,
  //   host: 'postgres',
  //   database: process.env.DB_NAME,
  //   password: process.env.DB_PASSWORD,
  //   port: process.env.DB_PORT,
  // });

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
      console.error('Error finding user ID:', err);
      throw err; 
    }
  }
  
  async function findUserByEmail(email) {
    try {
      const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
      return result.rows[0] || null;;
    } catch (err) {
      console.error('Erreur lors de la recherche par email:', err);
      throw err; 
    }
  }

  async function findUserById(id) {
    try {
      const result = await pool.query(`SELECT * FROM users WHERE id_user = $1`, [id]);
      return result.rows[0] || null;;
    } catch (err) {
      console.error('Erreur lors de la recherche par ID:', err);
      throw err; 
    }
  }





module.exports = {  addUser, findUserByEmail, findUserById, findIDbyemail };
