const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Ruta de registro
router.post('/register', async (req, res) => {
    const { Nombres, Apellidos, Correo, Fecha_nacimiento, Password } = req.body;

    // Validar que todos los campos estén presentes
    if (!Nombres || !Apellidos || !Correo || !Fecha_nacimiento || !Password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Verificar si el correo ya está en uso
        const existingUser = await User.findOne({ Correo });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(Password, 10);

        // Generar token de verificación
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Crear nuevo usuario
        const newUser = new User({
            Nombres,
            Apellidos,
            Correo,
            Fecha_nacimiento,
            Password: hashedPassword,
            verificationToken,
            isVerified: false // Inicializa el campo isVerified como false
        });

        // Guardar el nuevo usuario en la base de datos
        await newUser.save();

        // Configurar el transporte de nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'finanzapp9@gmail.com',
                pass: 'bzkp rhhl ymal tjej', // Asegúrate de usar una variable de entorno para esto
            },
        });

        // Enviar correo de verificación
        const mailOptions = {
            from: 'finanzapp9@gmail.com',
            to: Correo,
            subject: 'Verificación de correo electrónico - Finantec',
            text: `Por favor, verifica tu correo haciendo clic en el siguiente enlace: http://localhost:5000/api/users/verify/${verificationToken}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: 'Error sending email' });
            } else {
                return res.status(201).json({ message: 'User registered. Please verify your email.' });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ Correo: email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Verificar si el correo electrónico ha sido verificado
        if (!user.isVerified) {
            return res.status(400).json({ message: 'Email not verified', isVerified: false });
        }

        // Crear un token JWT con el ID y otros datos del usuario
        const token = jwt.sign(
            {
                id: user._id,
                Nombres: user.Nombres,
                Apellidos: user.Apellidos,
                Correo: user.Correo,
                Password: user.Password,
                Fecha_nacimiento: user.Fecha_nacimiento,
                isVerified: user.isVerified // Incluye el estado de verificación en el token
            },
            'jwtSecret', // Clave secreta (cámbiala a una variable de entorno en producción)
            { expiresIn: '1h' } // Expiración del token
        );

        // Responder con el token y el estado de verificación
        res.status(200).json({ message: 'Login successful', token, isVerified: user.isVerified });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Ruta para obtener los correos electrónicos de usuarios verificados
router.get('/emails', async (req, res) => {
    try {
        // Filtra solo los usuarios que tienen isVerified como True y selecciona solo el campo 'Correo'
        const users = await User.find({ isVerified: true }, 'Correo');
        const emails = users.map(user => user.Correo); // Extrae los correos
        res.status(200).json(emails);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Ruta para verificar correo electrónico
router.get('/verify/:token', async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });
        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        user.isVerified = true; // Marcar el usuario como verificado
        user.verificationToken = null; // Eliminar el token
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
