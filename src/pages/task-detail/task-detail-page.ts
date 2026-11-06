import { html, LitElement } from "lit";
import { PageController } from "@open-cells/page-controller";
import { customElement, property } from "lit/decorators.js";

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

	render() {
		return html`
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
