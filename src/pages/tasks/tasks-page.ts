import { html, LitElement } from "lit";
import { PageController } from "@open-cells/page-controller";
import { customElement, state } from "lit/decorators.js";
import { getTasks, getCategories } from "../../state/task-state.js";
import "../../components/task-item/task-item.js";
import type { Task } from "../../models/task.js";
import { TASKS_CHANGED, CATEGORIES_CHANGED } from "../../state/channels.js";
import type { Category } from "../../models/category.js";

@customElement("tasks-page")
export class TasksPage extends LitElement {
	pageController = new PageController(this);

	/** Copia reactiva de las tareas confirmadas en el estado compartido. */
  @state()
  private tasks: Task[] = getTasks();

  /** Categorías actuales utilizadas para construir el resumen por categoría. */
  @state()
  private categories: Category[] = getCategories();

  /**
   * Escucha cambios mientras el componente está conectado.
   * Cada aviso consulta una copia actualizada del estado compartido.
   */
  connectedCallback(): void {
    super.connectedCallback();

    this.pageController.subscribe(TASKS_CHANGED, () => {
      this.tasks = getTasks();
    });

    // Actualiza las categorías aunque todavía no tengan tareas asignadas.
    this.pageController.subscribe(CATEGORIES_CHANGED, () => {
      this.categories = getCategories();
    });
  }

  /** Retira ambas escuchas antes de completar la desconexión del componente. */
  disconnectedCallback(): void {
    this.pageController.unsubscribe(TASKS_CHANGED);
    this.pageController.unsubscribe(CATEGORIES_CHANGED);

    super.disconnectedCallback();
  }

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
    // Deriva los contadores de la colección actual para evitar valores desincronizados.
    const total = this.tasks.length;
    const pending = this.tasks.filter(
      (task) => task.status === "pending",
    ).length;
    const completed = this.tasks.filter(
      (task) => task.status === "completed",
    ).length;
    const uncategorized = this.tasks.filter(
      (task) => task.categoryId === undefined,
    ).length;
		return html`
			<div class="hero">
				<h1>Mis tareas</h1>
				<p>Consulta el estado de tus tareas y accede a su detalle.</p>
        <p>
          Total: ${total} · Pendientes: ${pending} · Completadas: ${completed}
        </p>
        <section aria-labelledby="category-summary-title">
          <h2 id="category-summary-title">Resumen por categoría</h2>
          <ul>
            ${this.categories.map((category) => {
              // El contador se deriva de las asignaciones actuales de las tareas.
              const count = this.tasks.filter(
                (task) => task.categoryId === category.id,
              ).length;

              return html`<li>${category.name}: ${count}</li>`;
            })}
            <li>Sin categoría: ${uncategorized}</li>
          </ul>
        </section>
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
