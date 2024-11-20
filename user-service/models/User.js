const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  Nombres: { type: String, required: true },
  Apellidos: { type: String, required: true },
  Correo: { type: String, required: true, unique: true },
  Fecha_nacimiento: { type: Date, required: true },
  Password: String,
  isVerified: { type: Boolean, default: false }, // Nuevo campo
  verificationToken: String, // Token de verificación
});

const User = mongoose.model('User', userSchema);

module.exports = User;
