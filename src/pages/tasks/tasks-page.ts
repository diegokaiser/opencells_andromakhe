import { html, LitElement } from "lit";
import { PageController } from "@open-cells/page-controller";
import { customElement } from "lit/decorators.js";

@customElement("tasks-page")
export class TasksPage extends LitElement {
	pageController = new PageController(this);

	/**
	 * Renderiza sin Shadow DOM para aprovechar los estilos globales
	 * de las páginas definidos por la plantilla.
	 */
	protected createRenderRoot(): HTMLElement | DocumentFragment {
		return this;
	}

	render() {
		return html`
			<div class="hero">
				<h1>Mis tareas</h1>
				<p>Consulta el estado de tus tareas y accede a su detalle.</p>
			</div>
			<div class="features">
				<!-- Lista provisional para practicar la navegación antes de incorporar datos reales. -->
				<ul>
					<li>
						<a href="#!/task/task-001">Practicar OpenCells</a>
						<span>Estado: Pendiente</span>
					</li>
				</ul>
			</div>
		`;
	}
}
