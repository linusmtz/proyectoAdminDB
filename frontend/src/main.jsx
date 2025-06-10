import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"

export const metadata = {
  title: "TaskMaster Pro - Organiza tu vida con estilo ✨",
  description: "Una hermosa aplicación de gestión de tareas con diseño moderno y funcionalidades avanzadas",
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
