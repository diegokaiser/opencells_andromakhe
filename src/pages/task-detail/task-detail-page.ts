import { html, LitElement } from "lit";
import { PageController } from "@open-cells/page-controller";
import { customElement, property, state } from "lit/decorators.js";
import type { Task } from "../../models/task.js";
import { getTaskById, getCategories, setTaskStatus, deleteTask } from "../../state/task-state.js";
import type { PropertyValues } from "lit";
import { TASKS_CHANGED } from "../../state/channels.js";

@customElement("task-detail-page")
export class TaskDetailPage extends LitElement {
	pageController = new PageController(this);
	/**
	 * Parámetros públicos que OpenCells actualiza al resolver la ruta.
	 * `id` identifica la tarea; es opcional porque inicialmente no hay
	 * parámetros.
	 */
	@property({ type: Object })
	params: { id?: string } = {};

  /** Error de una acción sobre la tarea; no modifica sus datos guardados. */
  @state()
  private errorMessage: string = "";

	/**
	 * Renderiza sin Shadow DOM para aprovechar los estilos globales
	 * de las páginas definidos por la plantilla.
	 */
	protected createRenderRoot(): HTMLElement | DocumentFragment {
		return this;
	}

  /**
   * Descarta errores anteriores al recibir otros parámetros de navegación.
   * Utiliza el ciclo de Lit sin depender del nombre de ruta de OpenCells.
   */
  protected willUpdate(changedProperties: PropertyValues): void {
    if (changedProperties.has("params")) {
      this.errorMessage = "";
    }
  }

  /**
   * Consulta la tarea correspondiente a los parámetros actuales.
   * No conserva otra copia que pueda quedar desactualizada al cambiar de ruta.
   */
  private get task(): Task | undefined {
    const id = this.params.id;

    return id === undefined ? undefined : getTaskById(id);
  }

  /**
   * Solicita el estado deseado y actualiza el detalle tras guardar.
   * El módulo compartido conserva las reglas y los datos de la tarea.
   */
  private handleStatusChange(status: Task["status"]): void {
    const id = this.params.id;

    if (id === undefined) {
      this.errorMessage = "No se ha indicado qué tarea actualizar.";
      return;
    }

    const result = setTaskStatus(id, status);

    if (!result.success) {
      this.errorMessage = result.error;
      return;
    }

    // Notifica el cambio confirmado antes de actualizar la vista o navegar.
    this.pageController.publish(TASKS_CHANGED, {});

    this.errorMessage = "";
    this.requestUpdate();
  }

  /**
   * Solicita eliminar la tarea actual y vuelve al listado si tiene éxito.
   * Si falla, conserva la página y muestra la explicación.
   */
  private handleDeleteTask(): void {
    const id = this.params.id;

    if (id === undefined) {
      this.errorMessage = "No se ha indicado qué tarea eliminar.";
      return;
    }

    const result = deleteTask(id);

    if (!result.success) {
      this.errorMessage = result.error;
      return;
    }

    // Notifica el cambio confirmado antes de actualizar la vista o navegar.
    this.pageController.publish(TASKS_CHANGED, {});

    this.errorMessage = "";
    this.pageController.navigate("tasks");
  }

	render() {
    const task = this.task;
    // Solo buscamos la categoría si existe una tarea con categoría asignada.
    const category =
      task?.categoryId === undefined
        ? undefined
        : getCategories().find((category) => category.id === task.categoryId);
		return html`
      ${task === undefined
        ? html`<p>No se ha encontrado esta tarea.</p>`
        : html`
          <h2>${task.title}</h2>
          <!-- Edita la tarea existente utilizando su identificador estable. -->
          <button
            type="button"
            @click=${() =>
              this.pageController.navigate("edit-task", { id: task.id })}
          >
            Editar tarea
          </button>
          <p>Categoría: ${category?.name ?? "Sin categoría"}</p>
          <p>
            Estado: ${task.status === "pending" ? "Pendiente" : "Completada"}
          </p>
          <!-- Solicita explícitamente el estado contrario al que muestra la tarea. -->
          <button
            type="button"
            @click=${() =>
              this.handleStatusChange(
                task.status === "pending" ? "completed" : "pending",
              )}
          >
            ${task.status === "pending"
              ? "Marcar como completada"
              : "Marcar como pendiente"}
          </button>
          <!-- Elimina la tarea mostrada y vuelve al listado tras confirmar el resultado. -->
          <button type="button" @click=${this.handleDeleteTask}>
            Eliminar tarea
          </button>
          <p>
            Creada:
            <time datetime=${task.createdAt}>
              ${new Date(task.createdAt).toLocaleString("es-ES")}
            </time>
          </p>
        `
      }
      <!-- Región disponible para anunciar los errores de las acciones. -->
      <p role="alert">${this.errorMessage}</p>
			<button
				class="page-back"
				@click="${() => this.pageController.navigate("tasks")}"
			>
				Volver a mis tareas
			</button>
			<div class="page-header">
				<h1>Detalle de tarea</h1>
				<p>Identificador: ${this.params.id ?? "Sin identificador"}</p>
			</div>
		`;
	}
}
