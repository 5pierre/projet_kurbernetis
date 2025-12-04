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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user
        FOREIGN KEY (id_user)
        REFERENCES users (id_user) 
);





