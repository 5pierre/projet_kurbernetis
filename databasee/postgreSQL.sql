CREATE TABLE IF NOT EXISTS users (
    id_user SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL,
    profileData VARCHAR(400) NOT NULL,
    password VARCHAR(500) NOT NULL,  
    name VARCHAR(30) NOT NULL                             
);

CREATE TABLE IF NOT EXISTS stories (
    id_story SERIAL PRIMARY KEY,
    content VARCHAR(5000) NOT NULL, 
    id_user INT NOT NULL, 

    CONSTRAINT fk_user
        FOREIGN KEY (id_user)
        REFERENCES users (id_user) 
);

-- admin default
INSERT INTO users (email, role, password, profileData, name) VALUES (
  'admin@admin.com',
  'admin',
  '$2b$10$wHJHo30.3oOZvpPSuZMKY.SkEfW8o7kx4qNoGTUsXSL8eRfc.AlIG', -- "1234" hashé
  'User Profile Data',
  'Admin User'
);

-- admin professor ;)
INSERT INTO users (email, role, password, profileData, name) VALUES (
  'manel.benhamouda@intervenants.efrei.net',
  'admin',
  '$2b$10$VfuZ2nSxBbAUG/KxX4IBWOGg8I4vbPttclRTZ0zG1rPVke/BWSVwG', -- "ManelBenhamouda1234!" hashé
  'la meilleur prof de securite!',
  'Manel BENHAMOUDA ADMIN'
);



