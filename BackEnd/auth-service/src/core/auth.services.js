const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { addUser, findUserByEmail } = require('../data/users'); // <-- remplacer createUser par addUser si besoin
const Key = process.env.JWT_SECRET;
let countUsers = 1; //BUG A FIX





async function registerUser(req, res) {
  try {
    const { name, email, password, role, profileData } = req.body;

    if (!email || !password || !role || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      console.log("User already exists, aborting registration");
      return res.status(400).json({ error: "User already exists" });
    }

    console.log("User does not exist, proceeding with registration");
    const hashed = await bcrypt.hash(password, 10);
    const user = await addUser(name, email, hashed, role, profileData);

    // Utilisez l'ID retourné par addUser plutôt qu'un compteur
    const token = jwt.sign({ 
      id: user.id_user || user.id, // Utilisez le vrai ID de la base
      name: user.name, 
      role: user.role, 
      email: user.email 
    }, Key, { expiresIn: '1h' });

    res.status(201).json({
      token,
      user: {
        id: user.id_user || user.id, // Utilisez le vrai ID
        name: user.name,
        email: user.email,
        role: user.role,
        profileData: user.profileData // Ajouté si pertinent
      }
    });
    console.log("User registered successfully");
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(400).json({ error: err.message });
  }
};


// LOGIN USER
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    console.log(user); // Debugging line

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password || user.hashedPassword);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });


    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, Key, { expiresIn: '1h' });
    res.status(200).json({
      token,
      user: {
        id: user.id || user.id_user,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });  
    
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
};

// LOGIN ADMIN
async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    console.log(user); // Debugging line

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const valid = await bcrypt.compare(password, user.password);
    
    console.log(password + "  " + user.password); // Debugging line
    if (valid) return res.status(401).json({ error: 'Invalid credentials' });//edited

    const token = jwt.sign({ id: countUsers++, role: user.role, email: user.email }, Key, { expiresIn: '1h' });
    console.log(countUsers, user.role, user.email); // Debugging line
    res.status(200).json({
      token,
      user: {
        id: countUsers,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });  
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
}



module.exports = { loginUser, registerUser, loginAdmin, };
