import { html, LitElement } from "lit";
import { PageController } from "@open-cells/page-controller";
import { customElement } from "lit/decorators.js";
import "../../components/task-item/task-item.js";
import type { Task } from "../../models/task.js";

@customElement("tasks-page")
export class TasksPage extends LitElement {
	pageController = new PageController(this);

	/** Dato provisional para comprobar la entrada del componente reutilizable. */
	private readonly exampleTasks: Task[] = [
		{
			id: "task-001",
			title: "Lista de compra",
			status: "completed",
		},
		{
			id: "task-002",
			title: "Crear lista de compra para BMO",
			status: "pending",
		},
	];

	/**
	 * Renderiza sin Shadow DOM para aprovechar los estilos globales
	 * de las páginas definidos por la plantilla.
	 */
	protected createRenderRoot(): HTMLElement | DocumentFragment {
		return this;
	}

	/**
	 * Recibe el identificador solicitado por task-item y abre su detalle.
	 * La página decide la navegación para mantener reutilizable el componente.
	 */
	private handleTaskDetailRequested(event: CustomEvent<{ id: string }>): void {
		this.pageController.navigate("task", { id: event.detail.id });
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
					${this.exampleTasks.map(
						(task) => html`
							<li>
								<task-item
									.task=${task}
									@task-detail-requested=${this.handleTaskDetailRequested}
								></task-item>
							</li>
						`,
					)}
				</ul>
			</div>
		`;
	}
}
