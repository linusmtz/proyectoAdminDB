import { useState, useEffect } from 'react'
import axios from 'axios'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [name, setName] = useState('')

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/tasks`)
      .then(res => setTasks(res.data))
      .catch(console.error)
  }, [])

  const createTask = () => {
    if (!name.trim()) return
    axios.post(`${import.meta.env.VITE_API_URL}/tasks`, { name })
      .then(res => {
        setTasks(t => [
          ...t,
          { id: { S: res.data.id }, name: { S: res.data.name } }
        ])
      })
    setName('')
  }

  const updateTask = id => {
    const newName = prompt('Nuevo nombre:', '')
    if (!newName) return
    axios.put(`${import.meta.env.VITE_API_URL}/tasks/${id}`, { name: newName })
      .then(() => {
        setTasks(t =>
          t.map(x => x.id.S === id ? { id: { S: id }, name: { S: newName } } : x)
        )
      })
  }

  const deleteTask = id => {
    axios.delete(`${import.meta.env.VITE_API_URL}/tasks/${id}`)
      .then(() => {
        setTasks(t => t.filter(x => x.id.S !== id))
      })
  }

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">📝 CRUD Tasks</h1>

      {/* Formulario */}
      <div className="input-group mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Nueva tarea"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={createTask}
        >
          Añadir
        </button>
      </div>

      {/* Lista de tareas */}
      <ul className="list-group">
        {tasks.length === 0 && (
          <li className="list-group-item text-center text-muted">
            No hay tareas aún.
          </li>
        )}
        {tasks.map(t => (
          <li
            key={t.id.S}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            {t.name.S}
            <div>
              <button
                onClick={() => updateTask(t.id.S)}
                className="btn btn-sm btn-outline-success me-2"
                title="Editar"
              >
                ✎
              </button>
              <button
                onClick={() => deleteTask(t.id.S)}
                className="btn btn-sm btn-outline-danger"
                title="Eliminar"
              >
                🗑
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
