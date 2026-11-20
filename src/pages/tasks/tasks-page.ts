import { html, LitElement } from "lit";
import { PageController } from "@open-cells/page-controller";
import { customElement, state } from "lit/decorators.js";
import { getTasks } from "../../state/task-state.js";
import "../../components/task-item/task-item.js";
import type { Task } from "../../models/task.js";

@customElement("tasks-page")
export class TasksPage extends LitElement {
	pageController = new PageController(this);

	/** Dato provisional para comprobar la entrada del componente reutilizable. */
	/** Copia reactiva de las tareas confirmadas en el estado compartido. */
  @state()
  private tasks: Task[] = getTasks();

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

  /**
   * Recupera las tareas actuales al entrar, incluyendo las creadas
   * mientras el listado permanecía fuera de la vista.
   */
  onPageEnter(): void {
    this.tasks = getTasks();
  }

	render() {
		return html`
			<div class="hero">
				<h1>Mis tareas</h1>
				<p>Consulta el estado de tus tareas y accede a su detalle.</p>
        <!-- Acceso al formulario sin modificar todavía la colección de tareas. -->
        <a href="#!/tasks/new">Crear tarea</a>
			</div>
			<div class="features">
        ${this.tasks.length === 0
          ? html`<p>Todavía no tienes tareas. Crea una para comenzar.</p>`
          : null
        }
				<!-- Cada componente recibe una tarea y comunica la solicitud de detalle. -->
				<ul>
					${this.tasks.map(
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
