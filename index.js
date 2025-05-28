const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.error('❌ Error conectando a MongoDB:', err));
require('dotenv').config(); // para cargar variables de entorno

const app = express();
const port = process.env.PORT || 3000;

// Conectar a MongoDB Atlas
const uri = process.env.MONGODB_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB conectado'))
.catch(err => console.error('Error conectando a MongoDB:', err));

// Definir esquema y modelo para tareas
const tareaSchema = new mongoose.Schema({
  texto: { type: String, required: true },
  completada: { type: Boolean, default: false },
}, { timestamps: true });

const Tarea = mongoose.model('Tarea', tareaSchema);

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas

// Obtener todas las tareas
app.get('/tareas', async (req, res) => {
  try {
    const tareas = await Tarea.find();
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo tareas' });
  }
});

// Agregar nueva tarea
app.post('/tareas', async (req, res) => {
  try {
    const nuevaTarea = new Tarea({ texto: req.body.texto });
    const tareaGuardada = await nuevaTarea.save();
    res.status(201).json(tareaGuardada);
  } catch (error) {
    res.status(500).json({ error: 'Error guardando tarea' });
  }
});

// Cambiar estado completada/no completada
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

// Eliminar tarea
app.delete('/tareas/:id', async (req, res) => {
  try {
    const tareaEliminada = await Tarea.findByIdAndDelete(req.params.id);
    if (!tareaEliminada) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(tareaEliminada);
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando tarea' });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
