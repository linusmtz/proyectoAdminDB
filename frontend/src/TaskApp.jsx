import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000/tasks'; // Cambia si usas otro puerto

export default function TaskApp() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  const fetchTasks = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setTasks(data.map(t => ({ id: t.id.S, name: t.name.S })));
  };

  const createTask = async () => {
    if (!newTask.trim()) return;
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTask })
    });
    setNewTask('');
    fetchTasks();
  };

  const updateTask = async (id, name) => {
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
  };

  const deleteTask = async id => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div style={{ padding: '1em' }}>
      <h1>Gestión de Tareas</h1>
      <input
        value={newTask}
        onChange={e => setNewTask(e.target.value)}
        placeholder="Nueva tarea"
      />
      <button onClick={createTask}>Agregar</button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(({ id, name }) => (
            <tr key={id}>
              <td>{id}</td>
              <td>
                <input
                  defaultValue={name}
                  onBlur={e => updateTask(id, e.target.value)}
                />
              </td>
              <td>
                <button onClick={() => deleteTask(id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
