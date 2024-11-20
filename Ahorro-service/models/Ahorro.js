// models/Ahorro.js
const mongoose = require('mongoose');

const ahorroSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goal: { type: String, required: true },
  amount: { type: Number, required: true },
  savedAmount: { type: Number, default: 0 },
  frequency: { type: String, enum: ['diario', 'semanal', 'mensual'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Ahorro', ahorroSchema);
