/**
 * Datos mínimos de una tarea compartidos por páginas y componentes.
 * El estado admite dos valores para evitar variantes inconsistentes.
 */
export type Task = {
	/** Identificador estable utilizado para abrir el detalle. */
	id: string;
  /** Referencia a una categoría; su ausencia indica una tarea sin categoría. */
  categoryId?: string;
	/** Texto que identifica la tarea para el usuario. */
	title: string;
	/** Situación actual de la tarea. */
	status: "pending" | "completed";
	/** Fecha de creación en formato ISO; se conserva al editar la tarea. */
	createdAt: string;
};

/**
 * Datos que aporta el formulario al solicitar una tarea nueva.
 * La creación asignará el identificador, la fecha y el estado inicial.
 */
export type CreateTaskInput = {
	title: string;
	categoryId?: string;
};

/**
 * Datos editables que el formulario envía al guardar.
 * La ausencia de categoryId elimina la asignación de categoría.
 * La identidad, fecha y estado de la tarea se conservan.
 */
export type UpdateTaskInput = {
	title: string;
	categoryId?: string;
};
