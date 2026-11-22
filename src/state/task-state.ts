import type { Task, CreateTaskInput, UpdateTaskInput } from "../models/task.js";
import type { Category } from "../models/category.js";

// Datos confirmados en memoria; se perderán al recargar la aplicación.
// Las colecciones permanecen privadas al módulo para controlar sus cambios.
let tasks: Task[] = [];
let categories: Category[] = [];

/**
 * Devuelve una copia de la colección y de cada tarea.
 * Permite consultar los datos sin modificar el estado interno desde fuera.
 */
export function getTasks(): Task[] {
	return tasks.map((task) => ({ ...task }));
}

/**
 * Busca una tarea por su identidad y devuelve una copia.
 * Si no existe, devuelve undefined para que la página gestione ese caso.
 */
export function getTaskById(id: string): Task | undefined {
	const task = tasks.find((task) => task.id === id);

	return task === undefined ? undefined : { ...task };
}

/**
 * Devuelve copias de las categorías para consultar sus datos
 * sin permitir cambios directos sobre el estado compartido.
 */
export function getCategories(): Category[] {
	return categories.map((category) => ({ ...category }));
}

/**
 * Crea una categoría con nombre válido y único, ignorando mayúsculas.
 * Centraliza las reglas para que todas las páginas creen datos coherentes.
 */
export function createCategory(name: string): CreateCategoryResult {
  const normalizedName = name.trim();

  if (normalizedName.length === 0) {
    return {
      success: false,
      error: "Escribe un nombre que no contenga solo espacios.",
    };
  }

  const alreadyExists = categories.some(
    (category) => category.name.toLowerCase() === normalizedName.toLowerCase(),
  );

  if (alreadyExists) {
    return {
      success: false,
      error: "Ya existe una categoría con ese nombre.",
    };
  }

  const category: Category = {
    id: crypto.randomUUID(),
    name: normalizedName,
  };

  categories = [...categories, category];

  // La copia evita exponer el objeto que conserva el estado compartido.
  return {
    success: true,
    category: { ...category },
  };
}

/**
 * Valida y crea una tarea en memoria, comprobando su categoría si se indica.
 * Genera la identidad, la fecha y el estado inicial en un único punto.
 * Devuelve una copia para evitar modificaciones externas del objeto guardado.
 */
export function createTask(input: CreateTaskInput): CreateTaskResult {
	const normalizedTitle = input.title.trim();

	if (normalizedTitle.length === 0) {
		return {
			success: false,
			error: "Escribe un título que no contenga solo espacios.",
		}
	}

	if (input.categoryId !== undefined) {
		const categoryExists = categories.some(
			(category) => category.id === input.categoryId,
		);

		if (!categoryExists) {
			return {
				success: false,
				error: "La categoría seleccionada no existe.",
			};
		}
	}

	const task: Task = {
    id: crypto.randomUUID(),
    title: normalizedTitle,
    status: "pending",
    createdAt: new Date().toISOString(),
	};

	if (input.categoryId !== undefined) {
		task.categoryId = input.categoryId;
	}

	tasks = [...tasks, task];

	return {
		success: true,
		task: { ...task },
	};
}

/**
 * Resultado de crear una categoría.
 * `success` permite distinguir los datos creados del error de validación.
 */
export type CreateCategoryResult =
	| { success: true; category: Category }
	| { success: false; error: string };

/**
 * Resultado de crear una tarea.
 * Solo incluye la tarea cuando la validación y la creación tienen éxito.
 */
export type CreateTaskResult =
	| { success: true; task: Task }
	| { success: false; error: string };

/**
 * Resultado de editar una tarea.
 * Distingue la tarea actualizada de un error sin exigir ambos datos a la vez.
 */
export type UpdateTaskResult =
	| { success: true; task: Task }
	| { success: false; error: string };

/**
 * Resultado de eliminar una tarea.
 * Confirma la eliminación o explica por qué no pudo realizarse.
 */
export type DeleteTaskResult =
	| { success: true }
	| { success: false; error: string };

/**
 * Valida y actualiza el título y la categoría de una tarea existente.
 * Conserva su identidad, fecha de creación y estado.
 * La ausencia de categoryId elimina la categoría asignada.
 */
export function updateTask(id: string, input: UpdateTaskInput): UpdateTaskResult {
  const taskIndex = tasks.findIndex(
    (task) => task.id === id,
  );

  if (taskIndex === -1) {
    return {
      success: false,
      error: "La tarea que intentas editar no existe.",
    };
  }

  const normalizedTitle = input.title.trim();

  if (normalizedTitle.length === 0) {
    return {
      success: false,
      error: "Escribe un título que no contenga solo espacios.",
    };
  }

  if (input.categoryId !== undefined) {
    const categoryExists = categories.some(
      (category) => category.id === input.categoryId,
    );

    if (!categoryExists) {
      return {
        success: false,
        error: "La categoría seleccionada no existe.",
      };
    }
  }

  const currentTask = tasks[taskIndex];

  const updatedTask: Task = {
    ...currentTask,
    title: normalizedTitle,
  };

  if (input.categoryId !== undefined) {
    updatedTask.categoryId = input.categoryId;
  } else {
    delete updatedTask.categoryId;
  }

  // Reemplaza solo la tarea editada y conserva las demás.
  tasks = tasks.map((task, index) =>
    index === taskIndex ? updatedTask : task,
  );

  return {
    success: true,
    task: { ...updatedTask },
  };
}

/**
 * Asigna el estado solicitado sin modificar los demás datos de la tarea.
 * Repetir la misma solicitud conserva el resultado.
 * Devuelve un error si el identificador no existe y una copia si tiene éxito.
 */
export function setTaskStatus(id: string, status: Task["status"]): UpdateTaskResult {
  const taskIndex = tasks.findIndex(
    (task) => task.id === id,
  );

  if (taskIndex === -1) {
    return {
      success: false,
      error: "La tarea cuyo estado intentas cambiar no existe.",
    };
  }

  const currentTask = tasks[taskIndex];

  const updatedTask: Task = {
    ...currentTask,
    status,
  };

  tasks = tasks.map((task, index) =>
    index === taskIndex ? updatedTask : task
  );

  return {
    success: true,
    task: { ...updatedTask },
  };
}

/**
 * Elimina únicamente la tarea identificada y conserva las demás.
 * Devuelve un error si no existe, sin modificar la colección.
 */
export function deleteTask(id: string): DeleteTaskResult {
  const taskExists = tasks.some(
    (task) => task.id === id
  );

  if (!taskExists) {
    return {
      success: false,
      error: "La tarea que intentas eliminar no existe.",
    };
  }

  tasks = tasks.filter(
    (task) => task.id !== id
  );

  return {
    success: true,
  };
}
