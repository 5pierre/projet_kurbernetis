CREATE TABLE IF NOT EXISTS users (
    id_user SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL,
    profileData VARCHAR(400) NOT NULL,
    password VARCHAR(500) NOT NULL,  
    name VARCHAR(30) NOT NULL                             
);

INSERT INTO users (email, role, password, profileData, name) VALUES (
  'admin@admin.com',
  'admin',
  '$2b$10$wHJHo30.3oOZvpPSuZMKY.SkEfW8o7kx4qNoGTUsXSL8eRfc.AlIG', -- "1234" hashé
  'User Profile Data',
  'Admin User'
);