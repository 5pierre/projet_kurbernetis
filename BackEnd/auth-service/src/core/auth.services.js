const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { addUser, findUserByEmail } = require('../data/users'); // <-- remplacer createUser par addUser si besoin
const fs = require('fs');
const Key = process.env.JWT_SECRET;
const loginAttempts = new Map();



async function registerUser(req, res) {
  try {
    const { name, email, password, profileData } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (password.length < 12) {
      return res.status(400).json({ error: "Password must be at least 12 characters long" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: "Password must contain at least one uppercase, one lowercase, one number, and one special character." 
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " User already exists, aborting registration\n");
    return res.status(400).json({ error: "User already exists" });
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

    res.status(201).json({ token });
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
    const now = Date.now();
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // if (loginAttempts.has(email)) {
    //         const attemptData = loginAttempts.get(email);
            
    //         if (attemptData.blockExpires && attemptData.blockExpires > now) {
    //             const timeLeft = Math.ceil((attemptData.blockExpires - now) / 1000 / 60);
    //             fs.appendFileSync('../../Log.txt', `${new Date().toISOString()} Brute Force Blocked: ${email}\n`);
    //             return res.status(429).json({ error: `Too many attempts. Try again in ${timeLeft} minutes.` });
    //         }
    //         if (attemptData.blockExpires && attemptData.blockExpires <= now) {
    //             loginAttempts.delete(email);
    //         }
    //     }

    const valid = await bcrypt.compare(password, user.password);
    console.log("Is Valid?", valid);
    console.log("test pwd: "+password+ " "+ user.password)


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
    res.status(500).json({ error: 'Internal error '+ err }); 
  }
//ajouter cookie Cookies avec attributs `HttpOnly`, `Secure`, `SameSite=Strict`- Timeout après 15-30 min d'inactivité

};


// LOGOUT
async function logoutUser(req, res) {
  
}

module.exports = { loginUser, registerUser, logoutUser };
