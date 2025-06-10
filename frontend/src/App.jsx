import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState('');

  // Hook para cargar todas las tareas al montar
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/tasks`)
      .then(res => setTasks(res.data));
  }, []);

  const createTask = () => {
    if (!name.trim()) return;
    axios.post(`${import.meta.env.VITE_API_URL}/tasks`, { name })
      .then(res => setTasks(prev => [...prev, { id: { S: res.data.id }, name: { S: res.data.name } }]));
    setName('');
  };

  const updateTask = id => {
    const newName = prompt('Nuevo nombre:');
    if (!newName) return;
    axios.put(`${import.meta.env.VITE_API_URL}/tasks/${id}`, { name: newName })
      .then(() => setTasks(prev =>
        prev.map(t => t.id.S === id ? { id: { S: id }, name: { S: newName } } : t)
      ));
  };

  const deleteTask = id => {
    axios.delete(`${import.meta.env.VITE_API_URL}/tasks/${id}`)
      .then(() => setTasks(prev => prev.filter(t => t.id.S !== id)));
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">CRUD Tasks</h1>
      <div className="mb-4 flex">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nueva tarea"
          className="border p-1 flex-grow mr-2"
        />
        <button onClick={createTask} className="bg-blue-500 text-white px-3 py-1 rounded">
          Crear
        </button>
      </div>
      <ul>
        {tasks.map(t => (
          <li key={t.id.S} className="flex justify-between mb-2">
            <span>{t.name.S}</span>
            <div>
              <button onClick={() => updateTask(t.id.S)} className="text-green-600 mr-2">✎</button>
              <button onClick={() => deleteTask(t.id.S)} className="text-red-600">🗑</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
