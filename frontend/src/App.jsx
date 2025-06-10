import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/tasks`)
      .then(res => setTasks(res.data));
  };

  const createTask = () => {
    if (!name.trim()) return;
    axios.post(`${import.meta.env.VITE_API_URL}/tasks`, { name })
      .then(() => {
        setName('');
        fetchTasks();
      });
  };

  const updateTask = (id, currentName) => {
    const newName = prompt('Nuevo nombre de la tarea:', currentName);
    if (!newName) return;
    axios.put(`${import.meta.env.VITE_API_URL}/tasks/${id}`, { name: newName })
      .then(() => fetchTasks());
  };

  const deleteTask = (id) => {
    if (!confirm('¿Estás seguro de borrar esta tarea?')) return;
    axios.delete(`${import.meta.env.VITE_API_URL}/tasks/${id}`)
      .then(() => fetchTasks());
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Gestor de Tareas</h1>

      <div className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nombre de la tarea"
          className="flex-grow border border-gray-300 p-2 rounded"
        />
        <button
          onClick={createTask}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Añadir
        </button>
      </div>

      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center py-4">No hay tareas registradas.</td>
            </tr>
          ) : (
            tasks.map(t => (
              <tr key={t.id.S} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{t.id.S}</td>
                <td className="border px-4 py-2">{t.name.S}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => updateTask(t.id.S, t.name.S)}
                    className="text-green-600 hover:underline mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteTask(t.id.S)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;

