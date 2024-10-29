import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheck, faUndo, faSpinner } from '@fortawesome/free-solid-svg-icons'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import "../../styles/index.css";
import { createUser, getUser, createUserTodo, updateUserTodoById, deleteUserTodo, deleteUserAllTasks } from '../api'; 

const Home = () => {
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const maxChars = 25;

  useEffect(() => {
    // Cargar nombre de usuario almacenado al inicio
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      handleLogin(storedUserName);
    }
  }, []);

  // Manejar inicio de sesión del usuario
  const handleLogin = async (user) => {
    setIsLoading(true); 
    try {
      const userResponse = await getUser(user);
      if (userResponse.notFound) {
        const userCreated = await createUser(user);
        if (!userCreated) {
          throw new Error('No se pudo crear el usuario');
        }
        setTasks([]); 
      } else {
        setTasks(userResponse.todos || []);
      }
      setUserName(user);
      setIsLoggedIn(true);
      localStorage.setItem('userName', user);
    } catch (error) {
      console.error("[DEBUG] Error durante el inicio de sesión:", error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false); 
    }
  };

  // Agregar una nueva tarea
  const addTask = async (element) => {
    if (element.key === "Enter" && newTask.trim()) {
      try {
        const newTaskData = { label: newTask, is_done: false };
        const createdTask = await createUserTodo(userName, newTaskData);
        if (createdTask && createdTask.id) {
          setTasks([...tasks, createdTask]);
          setNewTask('');
        } else {
          throw new Error('No se pudo crear la tarea');
        }
      } catch (error) {
        console.error("[DEBUG] Error al agregar la tarea:", error);
        setErrorMessage(error.message);
      }
    }
  };

  // Eliminar una tarea
  const deleteTask = async (index) => {
    try {
      const taskId = tasks[index].id;
      console.log(`[DEBUG] Eliminando tarea con id: ${taskId}`);
      const success = await deleteUserTodo(taskId);
      if (success) {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks); 
      } else {
        throw new Error('No se pudo eliminar la tarea');
      }
    } catch (error) {
      console.error("[DEBUG] Error al eliminar la tarea:", error);
      setErrorMessage(error.message);
    }
  };

  // Marcar una tarea como completada o no
  const checkTask = async (index) => {
    try {
      const task = tasks[index];
      const updatedTask = { ...task, is_done: !task.is_done }; 
      const success = await updateUserTodoById(task.id, updatedTask); 
      if (success) {
        const updatedTasks = tasks.map((t, i) => (i === index ? updatedTask : t));
        setTasks(updatedTasks); 
      } else {
        throw new Error('No se pudo actualizar la tarea');
      }
    } catch (error) {
      console.error("[DEBUG] Error al actualizar la tarea:", error);
      setErrorMessage(error.message);
    }
  };

  // Borrar todas las tareas
  const clearAllTasks = async () => {
    setIsLoading(true); 
    try {
      const todoListIds = tasks.map(task => task.id);
      const isSuccess = await deleteUserAllTasks(todoListIds);
      if (isSuccess) {
        setTasks([]); 
      } else {
        throw new Error("No ha sido posible eliminar todas las tareas.");
      }
    } catch (error) {
      console.error("[DEBUG] Error al borrar todas las tareas:", error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false); 
    }
  };

  const confirmClearTasks = () => {
    clearAllTasks();
    setIsModalOpen(false);
  };

  // Contamos las tareas pendientes
  const pendingTasksCount = tasks.filter(task => !task.is_done).length;

  return (
    <div id="backgroundPage" className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: "#2c3e50" }}>
      <div className="todo-container">
        {isLoading ? (
          <div className="d-flex justify-content-center mt-3">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          </div>
        ) : !isLoggedIn ? (
          <div>
            <h3 className="todo-title mb-3" style={{ fontSize: "20px" }}>Ingrese su nombre de usuario</h3>
            {errorMessage && <p className="text-danger">{errorMessage}</p>}
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Nombre de usuario"
              className="form-control mb-3"
            />
            <button onClick={() => handleLogin(userName)} className="btn btn-primary">Ingresar</button>
          </div>
        ) : (
          <div>
            <h1 className="todo-title">todos</h1>
            {errorMessage && <p className="text-danger">{errorMessage}</p>}
            <input
              type="text"
              placeholder="¿Qué hacemos hoy?"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={addTask}
              maxLength={maxChars}
              className="form-control mb-3"
            />

            <ul className="todo-list list-unstyled">
              {tasks.length === 0 ? (
                <li className="text-center">Cuanto vacío... 😲</li>
              ) : (
                tasks.map((task, index) => (
                  <li key={index} className="d-flex justify-content-between align-items-center task-item">
                    <span className={`task-text ${task.is_done ? "completed" : ""}`}>
                      {task.label}
                    </span>
                    <div className="icon-container">
                      {task.is_done ? (
                        <span className="check-icon hover-icon" onClick={() => checkTask(index)}>
                          <FontAwesomeIcon icon={faUndo} />
                        </span>
                      ) : (
                        <span className="check-icon hover-icon" onClick={() => checkTask(index)}>
                          <FontAwesomeIcon icon={faCheck} />
                        </span>
                      )}
                      <span className="delete-icon hover-icon" onClick={() => deleteTask(index)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </span>
                    </div>
                  </li>
                ))
              )}
            </ul>

            <p>{pendingTasksCount} item{pendingTasksCount !== 1 ? "s" : ""} left</p>

            <button
              className="btn btn-danger mt-3"
              style={{ display: tasks.length === 0 ? 'none' : 'block' }}
              data-bs-toggle="modal"
              onClick={() => setIsModalOpen(true)}
            >
              Borrar todo
            </button>

            {isModalOpen && (
              <>
                <div className="custom-backdrop"></div>
                <div className="modal fade show d-block" id="clearTasksModal" tabIndex="-1" aria-labelledby="clearTasksModalLabel" aria-hidden="true">
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h1 className="modal-title fs-5" id="clearTasksModalLabel">¿Estás seguro?</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setIsModalOpen(false)}></button>
                      </div>
                      <div className="modal-body">
                        Al confirmar eliminarás todas las tareas.
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                        <button type="button" className="btn btn-primary" onClick={confirmClearTasks}>Borrar todo</button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
