const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/api/auth.routes');

const app = express();
app.use(cors()); // a enlever en prod ?
app.use(express.json());

app.set('trust proxy', 1); 

app.use('/api/auth', authRoutes);

const port = 4000;
app.listen(port, () => {
    console.log(`Auth-service running at http://localhost:${port}`);
});


