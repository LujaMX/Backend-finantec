const express = require('express');
const router = express.Router();
const Ahorro = require('../models/Ahorro');

// Obtener los objetivos de ahorro de un usuario
router.get('/objetivos/:userId', async (req, res) => {
  try {
    const objetivos = await Ahorro.find({ userId: req.params.userId });
    res.json(objetivos);
  } catch (error) {
    res.status(500).send('Error al obtener los objetivos de ahorro');
  }
});

// Registrar un nuevo objetivo de ahorro
router.post('/objetivos/:userId', async (req, res) => {
  const { goal, amount, frequency } = req.body;
  try {
    const nuevoObjetivo = new Ahorro({
      userId: req.params.userId,
      goal,
      amount,
      frequency,
      savedAmount: 0, // Inicializar con 0 como cantidad abonada
    });
    await nuevoObjetivo.save();
    res.status(201).json(nuevoObjetivo);
  } catch (error) {
    res.status(400).send('Error al registrar el objetivo de ahorro');
  }
});

// Realizar un abono a un objetivo
router.post('/abonar/:goalId', async (req, res) => {
  const { amount } = req.body;
  try {
    const objetivo = await Ahorro.findById(req.params.goalId);
    if (!objetivo) {
      return res.status(404).send('Objetivo no encontrado');
    }

    // Verificar si el abono supera la cantidad de la meta
    const newSavedAmount = objetivo.savedAmount + parseFloat(amount);
    if (newSavedAmount > objetivo.amount) {
      return res.status(400).send('El abono supera la cantidad de la meta');
    }

    // Realizar el abono si no se supera la cantidad de la meta
    objetivo.savedAmount = newSavedAmount;
    await objetivo.save();
    res.json({ savedAmount: objetivo.savedAmount });
  } catch (error) {
    res.status(500).send('Error al abonar al objetivo');
  }
});
// Eliminar un objetivo de ahorro
router.delete('/objetivos/:goalId', async (req, res) => {
    try {
      const objetivo = await Ahorro.findByIdAndDelete(req.params.goalId);
      if (!objetivo) {
        return res.status(404).send('Objetivo no encontrado');
      }
      res.status(200).send('Objetivo de ahorro eliminado');
    } catch (error) {
      res.status(500).send('Error al eliminar el objetivo de ahorro');
    }
  });

module.exports = router;
