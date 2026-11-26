import type { Task } from "../models/task.js";
import type { Category } from "../models/category.js";

/**
 * Formato de tareas y categorías guardado en el navegador.
 * La versión identifica la estructura que esta aplicación sabe interpretar.
 */
export type StoredState = {
  version: 1;
  tasks: Task[];
  categories: Category[];
}

/**
 * Distingue un primer inicio, una recuperación válida y un fallo de lectura.
 * Evita confundir la ausencia de datos con contenido inválido.
 */
export type LoadStateResult =
	| { status: "empty" }
	| { status: "success"; data: StoredState }
	| { status: "error"; error: string };

/**
 * Resultado de guardar el estado.
 * Permite avisar si los cambios no pudieron persistirse en el navegador.
 */
export type SaveStateResult =
	| { success: true }
	| { success: false; error: string };

/**
 * Comprueba los campos de texto obligatorios de una tarea.
 * Rechaza objetos incompletos y textos vacíos sin modificar sus valores.
 */
function hasTaskTextFields(value: unknown): boolean {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	if (!("id" in value) || !("title" in value)) {
		return false;
	}

	return (
		typeof value.id === "string" &&
		typeof value.title === "string" &&
		value.id.trim().length > 0 &&
		value.title.trim().length > 0
	);
}

/**
 * Valida una tarea recuperada antes de permitir su uso en la aplicación.
 * La categoría puede estar ausente; su referencia se comprobará después.
 */
function isTask(value: unknown): value is Task {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	if (
		!("id" in value) ||
		!("title" in value) ||
		!("status" in value) ||
		!("createdAt" in value)
	) {
		return false;
	}

	const validCategory =
		!("categoryId" in value) ||
		value.categoryId === undefined ||
		typeof value.categoryId === "string";

	return (
		hasTaskTextFields(value) &&
		(value.status === "pending" || value.status === "completed") &&
		typeof value.createdAt === "string" &&
		!Number.isNaN(Date.parse(value.createdAt)) &&
		validCategory
	);
}

/**
 * Comprueba que una categoría recuperada tenga identidad y nombre válidos.
 * Rechaza datos incompletos sin modificar sus valores.
 */
function isCategory(value: unknown): value is Category {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	if (!("id" in value) || !("name" in value)) {
		return false;
	}

	return (
		typeof value.id === "string" &&
		typeof value.name === "string" &&
		value.id.trim().length > 0 &&
		value.name.trim().length > 0
	);
}

/**
 * Valida el formato guardado, sus elementos y las referencias de categorías.
 * Rechaza el estado completo si contiene datos incompatibles.
 */
function isStoredState(value: unknown): value is StoredState {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	if (
		!("version" in value) ||
		!("tasks" in value) ||
		!("categories" in value)
	) {
		return false;
	}

	if (
		value.version !== 1 ||
		!Array.isArray(value.tasks) ||
		!Array.isArray(value.categories)
	) {
		return false;
	}

	const tasks = value.tasks;
	const categories = value.categories;

	if (!tasks.every(isTask) || !categories.every(isCategory)) {
		return false;
	}

  // La identidad debe ser única dentro de cada colección.
  const taskIds = new Set(tasks.map((task) => task.id));
  const categoryIds = new Set(categories.map((category) => category.id));

  if (
    taskIds.size !== tasks.length ||
    categoryIds.size !== categories.length
  ) {
    return false;
  }

	return tasks.every(
		(task) =>
			task.categoryId === undefined ||
			categories.some((category) => category.id === task.categoryId),
	);
}

/** Clave reservada para las tareas y categorías de esta aplicación. */
const STORAGE_KEY = "andromakhe-state";
/**
 * Recupera el estado sin interrumpir el arranque si la lectura falla.
 * Distingue una clave ausente de contenido inválido o inaccesible.
 */
export function loadState(): LoadStateResult {
	try {
		const text = localStorage.getItem(STORAGE_KEY);

		if (text === null) {
			return { status: "empty" };
		}

		const data: unknown = JSON.parse(text);

		if (!isStoredState(data)) {
			return {
				status: "error",
				error: "Los datos guardados no tienen un formato válido.",
			};
		}

		return { status: "success", data };
	} catch {
		return {
			status: "error",
			error: "No se pudieron leer los datos guardados.",
		};
	}
}

/**
 * Guarda tareas y categorías juntas en una única entrada.
 * Comunica los fallos sin lanzar una excepción hacia la interfaz.
 */
export function saveState(state: StoredState): SaveStateResult {
	try {
		const text = JSON.stringify(state);
		localStorage.setItem(STORAGE_KEY, text);

		return { success: true };
	} catch {
		return {
			success: false,
			error: "No se pudieron guardar los cambios en el navegador.",
		};
	}
}
