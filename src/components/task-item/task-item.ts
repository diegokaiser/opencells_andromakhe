import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Task } from "../../models/task.js";

/**
 * Muestra una tarea y comunica la solicitud de consultar su detalle.
 * La página contenedora decide cómo responder, permitiendo reutilizar
 * el componente sin acoplarlo a las rutas de la aplicación.
 *
 * @fires task-detail-requested - CustomEvent<{ id: string }>;
 * detail.id identifica la tarea cuyo detalle se solicita.
 */
@customElement("task-item")
export class TaskItem extends LitElement {
	/**
	 * Tarea que proporciona la página para mostrar su título y estado.
	 * No se modifica desde este componente.
	 * Sin valor, el componente no mostrará contenido.
	 */
	@property({ attribute: false })
	task: Task | undefined = undefined;

	/**
	 * Solicita abrir el detalle sin decidir cómo se mostrará.
	 * @fires task-detail-requested - CustomEvent con detail: { id: string }.
	 */
	private requestDetail(): void {
		if (this.task === undefined) {
			return;
		}

		this.dispatchEvent(
			new CustomEvent<{ id: string }>("task-detail-requested", {
				detail: { id: this.task.id },
				bubbles: true,
				composed: true,
			}),
		);
	}

	/** Muestra los datos recibidos; evita representar una tarea inexistente. */
	render() {
		if (this.task === undefined) {
			return;
		}

		return html`
			<p>${this.task.title}</p>
			<span>
				Estado: ${this.task.status === "pending" ? "Pendiente" : "Completada"}
			</span>
			<button type="button" @click=${this.requestDetail}>Ver detalle</button>
		`;
	}
}
