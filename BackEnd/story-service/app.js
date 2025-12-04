const express = require('express');
const cors = require('cors');
const storyRoutes = require('./src/api/story.routes'); 
const cookieParser = require('cookie-parser');

const app = express();


app.use(cors({ 
    origin: 'http://localhost:3000', // Exemple en PROD
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.set('trust proxy', 1); 

app.use('/api/story', storyRoutes);

// Port d'écoute du Story Service
const port = 5000;

app.listen(port, () => {
    console.log(`Story-service running at http://localhost:${port}`);
});