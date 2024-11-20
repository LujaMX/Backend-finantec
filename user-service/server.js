const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const usersRouter = require('./routes/users');

const app = express();

// Conectar a MongoDB
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Rutas
app.use('/api/users', usersRouter); // Define la ruta base para el microservicio de usuarios

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
