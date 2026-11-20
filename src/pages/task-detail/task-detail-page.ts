import { html, LitElement } from "lit";
import { PageController } from "@open-cells/page-controller";
import { customElement, property } from "lit/decorators.js";
import type { Task } from "../../models/task.js";
import { getTaskById, getCategories } from "../../state/task-state.js";

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

	/**
	 * Renderiza sin Shadow DOM para aprovechar los estilos globales
	 * de las páginas definidos por la plantilla.
	 */
	protected createRenderRoot(): HTMLElement | DocumentFragment {
		return this;
	}

  /**
   * Consulta la tarea correspondiente a los parámetros actuales.
   * No conserva otra copia que pueda quedar desactualizada al cambiar de ruta.
   */
  private get task(): Task | undefined {
    const id = this.params.id;

    return id === undefined ? undefined : getTaskById(id);
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
          <p>
            Creada:
            <time datetime=${task.createdAt}>
              ${new Date(task.createdAt).toLocaleString("es-ES")}
            </time>
          </p>
        `
      }
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
