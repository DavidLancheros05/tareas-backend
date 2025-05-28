const express = require('express');

const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let tareas = [];

app.get('/tareas', (req, res) => {
  res.json(tareas);
});

app.post('/tareas', (req, res) => {
  const nuevaTarea = {
    id: Date.now().toString(),
    texto: req.body.texto,
    completada: false
  };
  tareas.push(nuevaTarea);
  res.status(201).json(nuevaTarea);
});

// Ruta DELETE agregada
// Ruta DELETE corregida (usa == en lugar de !== para comparación flexible)
app.delete('/tareas/:id', (req, res) => {
  const id = req.params.id;
  console.log(`Eliminando ID: ${id} (Tipo: ${typeof id})`); // Debug
  
  const tareaIndex = tareas.findIndex(t => t.id == id); // ¡Usa == en lugar de !==!
  
  if (tareaIndex !== -1) {
    const [tareaEliminada] = tareas.splice(tareaIndex, 1);
    res.json(tareaEliminada);
  } else {
    res.status(404).json({ error: "ID no encontrado. IDs disponibles: " + tareas.map(t => t.id).join(", ") });
  }
});

// Debug: Mostrar todas las rutas registradas
console.log("Rutas disponibles:");
app._router.stack.forEach((layer) => {
  if (layer.route) {
    console.log(
      `${Object.keys(layer.route.methods).join(", ").toUpperCase()} ${layer.route.path}`
    );
  }
});

app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});


app.use(cors({
  origin: ['https://tu-frontend.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));