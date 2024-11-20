const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const savingsRouter = require('./routes/ahorroRoutes');

const app = express();

// Conectar a MongoDB
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Rutas
app.use('/api/ahorro', savingsRouter); // Define la ruta base para el microservicio de usuarios

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
