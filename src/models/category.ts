/**
 * Categoría creada por el usuario para organizar tareas.
 * Separa la identidad estable del nombre visible para permitir renombrarla
 * sin cambiar las referencias de las tareas.
 */
export type Category = {
	/** Identificador estable de la categoría. */
	id: string;
	/** Nombre visible; se validará al crear la categoría. */
	name: string;
};
