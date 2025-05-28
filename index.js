const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // Importa uuid

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let tareas = [];

// Obtener todas las tareas
app.get('/tareas', (req, res) => {
  res.json(tareas);
});



app.post('/tareas', (req, res) => {
  const nuevaTarea = {
    id: uuidv4(),
    texto: req.body.texto,    // Aquí debe tomar el texto enviado
    completada: false
  };
  tareas.push(nuevaTarea);
  res.status(201).json(nuevaTarea);
});

// Cambiar estado de una tarea usando id
app.put('/tareas/:id', (req, res) => {
  const id = req.params.id;
  const tarea = tareas.find(t => t.id === id);
  if (tarea) {
    tarea.completada = !tarea.completada;
    res.json(tarea);
  } else {
    res.status(404).json({ error: 'Tarea no encontrada' });
  }
});

// Eliminar tarea usando id
app.delete('/tareas/:id', (req, res) => {
  const id = req.params.id;
  const index = tareas.findIndex(t => t.id === id);
  if (index !== -1) {
    const eliminada = tareas.splice(index, 1);
    res.json(eliminada[0]);
  } else {
    res.status(404).json({ error: 'Tarea no encontrada' });
  }
});

app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});