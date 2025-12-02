const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { addUser, findUserByEmail } = require('../data/users'); 
const fs = require('fs');
const Key = process.env.JWT_SECRET;

// REGISTER USER
async function registerUser(req, res) {
  try {
    const { name, email, password, profileData } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (password.length < 12) {
      return res.status(400).json({ error: "Password must be at least 12 characters long" });
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const typesCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar]
      .filter(Boolean).length;

    if (typesCount < 3) {
      return res.status(400).json({
        error: "Password must contain one lowercase or number or special character."
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " User already exists, aborting registration\n");
    return res.status(400).json({ error: "invalid credentials" });
    }

    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " User does not exist, proceeding with registration\n");

    const hashed = await bcrypt.hash(password, 10);
    const adduser = await addUser(name, email, hashed, "user", profileData);

    const token = jwt.sign({ 
      id: adduser.id, 
      name: name, 
      role: "user", 
      email: email 
    }, Key, { expiresIn: '10m' }); 

    res.status(200).json({
      token,
      user: { 
        id: adduser.id_user, 
        name: adduser.name,
        email: adduser.email,
        role: adduser.role
      }
    });
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " User registered successfully\n");

  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Error during registration: "+ err + "\n");
    res.status(400).json({ error: "internal error" }); 
  }
};


// LOGIN USER
async function loginUser(req, res) { 
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    //ajouter cookie Cookies avec attributs `HttpOnly`, `Secure`, `SameSite=Strict`- Timeout après 15-30 min d'inactivité
    //token stocké dans le cookie ? 

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id_user, role: user.role, email: user.email }, Key, { expiresIn: '1h' });
    res.status(200).json({
      token,
      user: { 
        id: user.id_user, 
        name: user.name,
        email: user.email,
        role: user.role
      }
    });  
    
  } catch (err) {
    res.status(500).json({ error: 'Internal error '}); 
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Error during login: "+ err + "\n");
  }

};



module.exports = { loginUser, registerUser };
