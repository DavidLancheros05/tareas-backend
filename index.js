const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

console.log('Mongo URI:', process.env.MONGODB_URI);
const app = express();
const port = process.env.PORT || 3000;

const Tarea = require('./models/Tarea'); // Solo importa el modelo

// Conectar a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB conectado'))
.catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas

app.get('/tareas', async (req, res) => {
  try {
    const tareas = await Tarea.find();
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo tareas' });
  }
});

app.post('/tareas', async (req, res) => {
  try {
    const nuevaTarea = new Tarea({ texto: req.body.texto });
    const tareaGuardada = await nuevaTarea.save();
    res.status(201).json(tareaGuardada);
  } catch (error) {
    res.status(500).json({ error: 'Error guardando tarea' });
  }
});

app.put('/tareas/:id', async (req, res) => {
  try {
    const tarea = await Tarea.findById(req.params.id);
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });

    tarea.completada = !tarea.completada;
    const tareaActualizada = await tarea.save();

    res.json(tareaActualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando tarea' });
  }
});

app.delete('/tareas/:id', async (req, res) => {
  try {
    const tareaEliminada = await Tarea.findByIdAndDelete(req.params.id);
    if (!tareaEliminada) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(tareaEliminada);
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando tarea' });
  }
});

// Ruta para estadísticas
app.get('/tareas/stats', async (req, res) => {
  try {
    const total = await Tarea.countDocuments();
    const completadas = await Tarea.countDocuments({ completada: true });
    const pendientes = total - completadas;
    const porcentaje = total === 0 ? 0 : (completadas / total) * 100;

    res.json({ total, completadas, pendientes, porcentaje });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
