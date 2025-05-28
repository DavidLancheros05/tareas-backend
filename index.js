const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // ajusta si usas dominios específicos
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const Tarea = require('./models/Tarea');
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB conectado'))
.catch(err => console.error('❌ Error conectando a MongoDB:', err));

app.use(cors());
app.use(express.json());

// Emitir a todos los clientes conectados
io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado');

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado');
  });
});

// 🚀 Emitir eventos desde las rutas

app.post('/tareas', async (req, res) => {
  try {
    const nuevaTarea = new Tarea({ texto: req.body.texto });
    const tareaGuardada = await nuevaTarea.save();
    io.emit('tareaAgregada', tareaGuardada); // ✨
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
    io.emit('tareaActualizada', tareaActualizada); // ✨
    res.json(tareaActualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando tarea' });
  }
});

app.delete('/tareas/:id', async (req, res) => {
  try {
    const tareaEliminada = await Tarea.findByIdAndDelete(req.params.id);
    if (!tareaEliminada) return res.status(404).json({ error: 'Tarea no encontrada' });
    io.emit('tareaEliminada', tareaEliminada._id); // ✨
    res.json(tareaEliminada);
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando tarea' });
  }
});

app.get('/tareas', async (req, res) => {
  try {
    const tareas = await Tarea.find(); // busca todas las tareas en MongoDB
    res.json(tareas); // devuelve la lista en JSON
  } catch (error) {
    res.status(500).json({ error: 'Error cargando tareas' });
  }
});

server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});


app.get('/tareas/stats', async (req, res) => {
  try {
    // Ejemplo básico de estadísticas: contar tareas totales y tareas completadas
    const totalTareas = await Tarea.countDocuments();
    const tareasCompletadas = await Tarea.countDocuments({ completada: true });

    res.json({
      total: totalTareas,
      completadas: tareasCompletadas,
      pendientes: totalTareas - tareasCompletadas,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});