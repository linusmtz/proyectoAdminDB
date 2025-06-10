"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, CheckCircle, Circle, Filter, Calendar, Star, Zap } from "lucide-react"

const API_BASE = "http://18.118.215.11:3000"

export default function TaskApp() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "Personal",
  })
  const [editingTask, setEditingTask] = useState(null)
  const [filter, setFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/tasks`)
      .then((res) => res.json())
      .then(setTasks)
      .catch((err) => console.error("Error fetching tasks:", err))
  }, [])

  // Filtrar tareas según el filtro seleccionado
  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true
    if (filter === "completed") return task.completed
    if (filter === "pending") return !task.completed
    return true
  })

  // Estadísticas
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
    high: tasks.filter((t) => t.priority === "high" && !t.completed).length,
  }

  // Abrir diálogo para añadir tarea
  const openAddDialog = () => {
    setNewTask({ title: "", description: "", priority: "medium", category: "Personal" })
    setEditingTask(null)
    setIsAddDialogOpen(true)
  }

  // Cerrar diálogo
  const closeAddDialog = () => {
    setIsAddDialogOpen(false)
    setEditingTask(null)
  }

  const handleAddTask = () => {
    if (!newTask.title.trim()) return
    fetch(`${API_BASE}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    })
      .then((res) => res.json())
      .then((created) => {
        setTasks((t) => [created, ...t])
        closeAddDialog()
      })
      .catch((err) => console.error("Error creating task:", err))
  }

  // 5) INICIAR edición
  const startEdit = (task) => {
    setEditingTask(task)
    setNewTask({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      category: task.category,
    })
    setIsAddDialogOpen(true)
  }

  // 6) GUARDAR edición → PUT /tasks/:id
  const handleEditTask = () => {
    if (!newTask.title.trim()) return
    fetch(`${API_BASE}/tasks/${editingTask.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    })
      .then((res) => res.json())
      .then((updated) => {
        setTasks((t) =>
          t.map((task) => (task.id === updated.id ? updated : task))
        )
        closeAddDialog()
      })
      .catch((err) => console.error("Error updating task:", err))
  }

  // 7) TOGGLE completar → PUT /tasks/:id
  const toggleComplete = (id) => {
    const task = tasks.find((t) => t.id === id)
    fetch(`${API_BASE}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    })
      .then((res) => res.json())
      .then((updated) => {
        setTasks((t) =>
          t.map((tk) => (tk.id === id ? updated : tk))
        )
      })
      .catch((err) => console.error("Error toggling complete:", err))
  }

  // 8) BORRAR tarea → DELETE /tasks/:id
  const deleteTask = (id) => {
    fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" })
      .then((res) => {
        if (res.ok) setTasks((t) => t.filter((tk) => tk.id !== id))
      })
      .catch((err) => console.error("Error deleting task:", err))
  }
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
      case "medium":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
      case "low":
        return "bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "Trabajo":
        return "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
      case "Personal":
        return "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
      case "Salud":
        return "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg"
      case "Educación":
        return "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header con efecto glassmorphism */}
      <header className="glass sticky top-0 z-40 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                TaskMaster Pro ✨
              </h1>
              <p className="text-gray-600 text-lg">Organiza tu vida con estilo y elegancia</p>
            </div>

            <button
              onClick={openAddDialog}
              className="gradient-primary hover-glow text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Plus size={20} />
              Nueva Tarea
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass hover-glow transition-all duration-300 hover:scale-105 p-6 rounded-2xl text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>

          <div className="glass hover-glow transition-all duration-300 hover:scale-105 p-6 rounded-2xl text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completadas</div>
          </div>

          <div className="glass hover-glow transition-all duration-300 hover:scale-105 p-6 rounded-2xl text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Circle className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>

          <div className="glass hover-glow transition-all duration-300 hover:scale-105 p-6 rounded-2xl text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.high}</div>
            <div className="text-sm text-gray-600">Alta Prioridad</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="glass mb-8 p-6 rounded-2xl">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { key: "all", label: "Todas", count: stats.total },
              { key: "pending", label: "Pendientes", count: stats.pending },
              { key: "completed", label: "Completadas", count: stats.completed },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-full px-6 py-2 font-medium transition-all duration-200 flex items-center gap-2 ${
                  filter === key
                    ? "gradient-primary text-white shadow-lg hover-glow"
                    : "bg-white/50 hover:bg-white/80 text-gray-700 border border-white/30"
                }`}
              >
                {label}
                <span className="bg-white/20 text-current px-2 py-1 rounded-full text-xs font-bold">{count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lista de tareas */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="glass p-16 rounded-2xl text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
                <Star className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Todo listo! ✨</h3>
              <p className="text-gray-600 mb-6 text-lg">
                {filter === "completed"
                  ? "No tienes tareas completadas aún"
                  : filter === "pending"
                    ? "¡Genial! No tienes tareas pendientes"
                    : "Crea tu primera tarea para comenzar tu viaje productivo"}
              </p>
              <button
                onClick={openAddDialog}
                className="gradient-primary hover-glow text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Crear Primera Tarea
              </button>
            </div>
          ) : (
            filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className={`glass hover-glow transition-all duration-300 hover:scale-[1.02] p-6 rounded-2xl ${
                  task.completed ? "opacity-75" : ""
                } animate-in slide-in-from-bottom-4`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleComplete(task.id)}
                    className="mt-1 p-0 hover:bg-transparent transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-500 hover:text-green-600 transition-colors" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-lg font-semibold mb-2 ${
                        task.completed ? "line-through text-gray-500" : "text-gray-800"
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.description && <p className="text-gray-600 mb-4 leading-relaxed">{task.description}</p>}

                    <div className="flex flex-wrap gap-2">
                      <span className={`${getPriorityColor(task.priority)} px-3 py-1 rounded-full font-medium text-sm`}>
                        {task.priority === "high" ? "🔥 Alta" : task.priority === "medium" ? "⚡ Media" : "🌱 Baja"}
                      </span>
                      <span className={`${getCategoryColor(task.category)} px-3 py-1 rounded-full font-medium text-sm`}>
                        {task.category === "Trabajo"
                          ? "💼"
                          : task.category === "Personal"
                            ? "🏠"
                            : task.category === "Salud"
                              ? "💚"
                              : "📚"}{" "}
                        {task.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(task)}
                      className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full p-2 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-2 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal para añadir/editar tarea */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 backdrop-blur-md bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 flex items-center justify-center p-4 z-50">
          <div className="glass max-w-md w-full mx-4 rounded-2xl border-white/20">
            <div className="p-6 border-b border-white/20">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {editingTask ? "✏️ Editar tarea" : "✨ Nueva tarea"}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
                  Título
                </label>
                <input
                  type="text"
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-3 glass border-white/20 focus:border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  placeholder="¿Qué necesitas hacer?"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                  Descripción (opcional)
                </label>
                <textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-3 glass border-white/20 focus:border-indigo-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  rows="3"
                  placeholder="Añade detalles adicionales..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="priority" className="block text-sm font-semibold text-gray-700">
                    Prioridad
                  </label>
                  <select
                    id="priority"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-3 glass border-white/20 focus:border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  >
                    <option value="low">🌱 Baja</option>
                    <option value="medium">⚡ Media</option>
                    <option value="high">🔥 Alta</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-700">
                    Categoría
                  </label>
                  <select
                    id="category"
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="w-full px-4 py-3 glass border-white/20 focus:border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  >
                    <option value="Personal">🏠 Personal</option>
                    <option value="Trabajo">💼 Trabajo</option>
                    <option value="Salud">💚 Salud</option>
                    <option value="Educación">📚 Educación</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-white/20">
              <button
                onClick={closeAddDialog}
                className="bg-white/50 hover:bg-white/80 border border-white/20 rounded-xl px-6 py-2 font-medium text-gray-700 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={editingTask ? handleEditTask : handleAddTask}
                className="gradient-primary hover-glow text-white font-semibold rounded-xl px-6 py-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                {editingTask ? "💾 Guardar" : "✨ Añadir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
