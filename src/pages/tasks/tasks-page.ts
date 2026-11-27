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

  /** Selección local que limita las tareas visibles sin modificar la colección. */
  @state()
  private statusFilter: "all" | "pending" | "completed" = "all";

  /**
   * Selección de categoría: all, uncategorized o un identificador existente.
   * Solo afecta a la vista; no modifica las asignaciones de las tareas.
   */
  @state()
  private categoryFilter: string = "all";

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
   * Selecciona las tareas que cumplen ambos filtros.
   * Conserva intacta la colección utilizada por los contadores generales.
   */
  private get filteredTasks(): Task[] {
    return this.tasks.filter((task) => {
      const matchesStatus =
        this.statusFilter === "all" ||
        task.status === this.statusFilter;

      const matchesCategory =
        this.categoryFilter === "all" ||
        (this.categoryFilter === "uncategorized" &&
          task.categoryId === undefined) ||
        task.categoryId === this.categoryFilter;

      return matchesStatus && matchesCategory;
    });
  }

  /**
   * Valida la selección antes de actualizar el filtro reactivo.
   * No modifica las tareas guardadas, solo cuáles se muestran.
   */
  private handleStatusFilterChange(event: Event): void {
    const select = event.currentTarget;

    if (!(select instanceof HTMLSelectElement)) {
      return;
    }

    const value = select.value;

    if (value === "all" || value === "pending" || value === "completed") {
      this.statusFilter = value;
    }
  }

  /** Acepta opciones reservadas o categorías existentes antes de actualizar la vista. */
  private handleCategoryFilterChange(event: Event): void {
    const select = event.currentTarget;

    if (!(select instanceof HTMLSelectElement)) {
      return;
    }

    const value = select.value;
    const categoryExists = this.categories.some(
      (category) => category.id === value,
    );

    if (value === "all" || value === "uncategorized" || categoryExists) {
      this.categoryFilter = value;
    }
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
        <label for="task-status-filter">Filtrar por estado</label>
        <select
          id="task-status-filter"
          .value=${this.statusFilter}
          @change=${this.handleStatusFilterChange}
        >
          <option value="all">Todas</option>
          <option value="pending">Pendientes</option>
          <option value="completed">Completadas</option>
        </select>
        <label for="task-category-filter">Filtrar por categoría</label>
        <select
          id="task-category-filter"
          .value=${this.categoryFilter}
          @change=${this.handleCategoryFilterChange}
        >
          <option value="all">Todas las categorías</option>
          <option value="uncategorized">Sin categoría</option>
          ${this.categories.map(
            (category) => html`
              <option value=${category.id}>${category.name}</option>
            `,
          )}
        </select>
        ${this.tasks.length > 0 && this.filteredTasks.length === 0
          ? html`<p>No hay tareas que coincidan con los filtros.</p>`
          : null}
				<!-- Cada componente recibe una tarea y comunica la solicitud de detalle. -->
				<ul class="task-list">
					${this.filteredTasks.map(
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
