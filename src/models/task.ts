/**
 * Datos mínimos de una tarea compartidos por páginas y componentes.
 * El estado admite dos valores para evitar variantes inconsistentes.
 */
export type Task = {
	/** Identificador estable utilizado para abrir el detalle. */
	id: string;
	/** Texto que identifica la tarea para el usuario. */
	title: string;
	/** Situación actual de la tarea. */
	status: "pending" | "completed";
};
