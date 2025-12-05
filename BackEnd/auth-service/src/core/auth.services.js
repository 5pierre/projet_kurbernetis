const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { addUser, findUserByEmail } = require('../data/users'); 
const fs = require('node:fs');
const Key = process.env.JWT_SECRET;


const COOKIE_SETTING = {
  httpOnly: true,       // Protection XSS
  secure: false,         // Envoi uniquement via HTTPS //process.env.NODE_ENV === 'production', 
  sameSite: 'Strict',   // Protection CSRF
  maxAge: 15 * 60 * 1000 // 15 minutes
};  


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
    if (password.length < 12 || password.length > 50) {
      return res.status(400).json({ error: "Password must be between 12 and 50 characters long" });
    }
    if ( email.length < 6 || email.length > 320) {
      return res.status(400).json({ error: "Email must be between 6 and 320 characters long" });
    }

    //Longueur : Min/Max respectés pour name, email, password, profileData
    if (name.length < 3 || name.length > 50) {
      return res.status(400).json({ error: "Name must be between 3 and 50 characters long" });
    }
    if (profileData && profileData.length > 500) {
      return res.status(400).json({ error: "Profile data must be less than 500 characters long" });
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

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
    }, Key, { expiresIn: '15m' }); 

    res.cookie('token', token, COOKIE_SETTING);

    res.status(200).json({
      message: "Registration successful",
      user: { 
        id: adduser.id,
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
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ 
      id: user.id_user, 
      role: user.role, 
      email: user.email 
    }, Key, { expiresIn: '15m' });

    res.cookie('token', token, COOKIE_SETTING);
    
    res.status(200).json({
      message: "Registration successful",
      user: { 
        id: user.id_user, 
        name: user.name,
        email: user.email,
        role: user.role
      }
    }); 
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " User "+ user.email +" logged in successfully\n");
  } catch (err) {
    res.status(500).json({ error: 'Internal error '}); 
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Error during login: "+ err + "\n");
  }

};


createInitialAdmin(); 

async function createInitialAdmin() {
  try {
    const adminName = process.env.ADMIN_name;
    const adminEmail = process.env.ADMIN_email;
    const adminPassword = process.env.ADMIN_Password;
    const adminProfileData = process.env.ADMIN_profileData;
    const existingAdmin = await findUserByEmail(adminEmail);
    if (existingAdmin) {
      fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Admin user already exists, skipping creation\n");
      return;
    }
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await addUser(adminName, adminEmail, hashedPassword, "admin", adminProfileData, adminName);
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Admin user created successfully\n");

  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Error creating admin user: " + err + "\n");
  }
}


module.exports = { loginUser, registerUser };
