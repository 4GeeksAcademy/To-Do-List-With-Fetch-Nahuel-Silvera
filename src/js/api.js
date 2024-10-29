// URL base de la API para las operaciones de la lista de tareas
const API_BASE_URL = 'https://playground.4geeks.com/todo';

// Crear un nuevo usuario en la API
export const createUser = async (userName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([]),
    });
    if (!response.ok) {
      throw new Error(`Error al crear usuario: ${response.statusText}`);
    }
    return response.ok;
  } catch (error) {
    console.error("[Error EndPoint] Fail to Create User: ", error);
    return false;
  }
};

// Obtener un usuario existente por su nombre
export const getUser = async (userName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userName}`);
    if (!response.ok) {
      if (response.status === 404) {
        return { notFound: true };
      } else {
        throw new Error(`Error al obtener las tareas: ${response.statusText}`);
      }
    }
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error(error);
    return { notFound: true, todos: [] };
  }
};

// Crear una nueva tarea para un usuario existente
export const createUserTodo = async (userName, newTodo) => {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/${userName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTodo),
    });
    if (!response.ok) throw new Error(`Error al crear tarea: ${response.statusText}`);
    return await response.json(); // Devolver la tarea creada con su ID
  } catch (error) {
    console.error(error);
    return false;
  }
};

// Actualizar la lista de tareas de un usuario existente
export const updateUserTodo = async (userName, updatedTasks) => {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/${userName}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedTasks),
    });
    if (!response.ok) throw new Error(`Error al actualizar tareas: ${response.statusText}`);
    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
};

// Actualizar una tarea existente de un usuario por su ID
export const updateUserTodoById = async (todoId, todoData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    });

    console.log("response: " + response);

    if (!response.ok) {
      throw new Error(`Error al actualizar la tarea: ${response.statusText}`);
    }

    return await response.json(); // Devolver la tarea actualizada
  } catch (error) {
    console.error("Error en updateUserTodoById:", error);
    return false;
  }
};

// Eliminar una tarea de un usuario existente
export const deleteUserTodo = async (todoId) => {
  const url = `${API_BASE_URL}/todos/${todoId}`;
  try {
    console.log(`Enviando solicitud DELETE a: ${url}`);
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) throw new Error(`Error al eliminar tarea: ${response.statusText}`);
    return true; // Devuelve true para indicar éxito
  } catch (error) {
    console.error("Error en deleteUserTodo:", error);
    return false;
  }
};

// Eliminar todas las tareas de un usuario existente
export const deleteUserAllTasks = async (todoListIds) => {
  try {
    for (const todoId of todoListIds) {
      const url = `${API_BASE_URL}/todos/${todoId}`;
      console.log(`Enviando solicitud DELETE a: ${url}`);
      const response = await fetch(url, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Error al eliminar tarea con id ${todoId}: ${response.statusText}`);
    }
    return true; // Si todo se eliminó, devuelve true.
  } catch (error) {
    console.error("[ERROR] No se pudo eliminar todas las tareas: ", error);
    return false;
  }
};
