const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const fs = require('fs');
const fastcsv = require('fast-csv');

const app = express();
const port = process.env.PORT || 5003;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuración del pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Limita el número de conexiones simultáneas
    queueLimit: 0 // No limita la cantidad de consultas en cola
});

// Endpoint para registrar gastos
app.post('/api/expenses/registerExpense', (req, res) => {
    const { userId, expenses } = req.body;
    const sql = 'INSERT INTO expenses (user_id, type, name, cost, created_at) VALUES ?';
    const values = expenses.map(expense => [userId, expense.type, expense.name, expense.cost, new Date()]);

    pool.query(sql, [values], (err, result) => {
        if (err) {
            console.error('Error al registrar gastos:', err);
            return res.status(500).json({ message: 'Error al registrar gastos' });
        }
        res.status(201).json({ message: 'Gastos registrados con éxito', result });
    });
});

// Endpoint para registrar servicios
app.post('/api/expenses/registerService', (req, res) => {
    const { userId, services } = req.body;
    const sql = 'INSERT INTO services (user_id, type, cost, frequency, created_at) VALUES ?';
    const values = services.map(service => [userId, service.type, service.cost, service.frequency, new Date()]);

    pool.query(sql, [values], (err, result) => {
        if (err) {
            console.error('Error al registrar servicios:', err);
            return res.status(500).json({ message: 'Error al registrar servicios' });
        }
        res.status(201).json({ message: 'Servicios registrados con éxito', result });
    });
});

// Ruta para mostrar los gastos
app.get('/api/expenses/showExpenses', (req, res) => {
    const userId = req.query.userId;

    pool.query(
        'SELECT * FROM expenses WHERE user_id = ?',
        [userId],
        (error, results) => {
            if (error) {
                console.error('Error fetching expenses:', error);
                return res.status(500).json({ error: 'Error fetching expenses' });
            }
            res.json(results.map(expense => ({ ...expense, created_at: expense.created_at }))); // Incluir created_at
        }
    );
});

// Ruta para mostrar los servicios
app.get('/api/expenses/showServices', (req, res) => {
    const userId = req.query.userId;

    pool.query(
        'SELECT * FROM services WHERE user_id = ?',
        [userId],
        (error, results) => {
            if (error) {
                console.error('Error fetching services:', error);
                return res.status(500).json({ error: 'Error fetching services' });
            }
            res.json(results.map(service => ({ ...service, created_at: service.created_at }))); // Incluir created_at
        }
    );
});

// Ruta para exportar gastos en CSV
app.get('/api/expenses/exportExpenses', (req, res) => {
    const userId = req.query.userId;
    const query = 'SELECT * FROM expenses WHERE user_id = ?';

    pool.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Error fetching expenses:', error);
            return res.status(500).json({ error: 'Error fetching expenses' });
        }

        // Generar CSV
        const ws = fs.createWriteStream('expenses.csv');
        fastcsv
            .write(results, { headers: true })
            .pipe(ws)
            .on('finish', () => {
                // Enviar el archivo CSV al cliente
                res.download('expenses.csv', 'expenses.csv', err => {
                    if (err) {
                        console.error('Error al enviar archivo CSV:', err);
                        return res.status(500).json({ error: 'Error al enviar archivo CSV' });
                    }
                });
            });
    });
});

// Ruta para exportar servicios en CSV
app.get('/api/expenses/exportServices', (req, res) => {
    const userId = req.query.userId;
    const query = 'SELECT * FROM services WHERE user_id = ?';

    pool.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Error fetching services:', error);
            return res.status(500).json({ error: 'Error fetching services' });
        }

        // Generar CSV
        const ws = fs.createWriteStream('services.csv');
        fastcsv
            .write(results, { headers: true })
            .pipe(ws)
            .on('finish', () => {
                // Enviar el archivo CSV al cliente
                res.download('services.csv', 'services.csv', err => {
                    if (err) {
                        console.error('Error al enviar archivo CSV:', err);
                        return res.status(500).json({ error: 'Error al enviar archivo CSV' });
                    }
                });
            });
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
