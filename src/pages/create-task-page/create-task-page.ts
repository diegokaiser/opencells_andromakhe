import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { PageController } from "@open-cells/page-controller";
import type { Category } from "../../models/category.js";
import type { Task, CreateTaskInput } from "../../models/task.js";
import {
	createTask,
	getCategories,
  getTaskById,
  updateTask,
} from "../../state/task-state.js";

/**
 * Formulario compartido de creación y edición de tareas.
 * Conserva el borrador en los campos hasta confirmar el guardado.
 * EditTaskPage lo reutiliza con una etiqueta propia para sus hooks de página.
 */
@customElement("create-task-page")
export class CreateTaskPage extends LitElement {
	pageController = new PageController(this);

  /**
   * Parámetros públicos asignados por OpenCells.
   * Sin id se crea una tarea; con id se solicita editar una existente.
   */
  @property({ type: Object })
  params: { id?: string } = {};

  /** Categorías disponibles para asignar al borrador de la tarea. */
  @state()
  private categories: Category[] = getCategories();

  /** Error de validación o guardado; no descarta el borrador del formulario. */
  @state()
  private errorMessage: string = "";

  /**
   * Copia de la tarea consultada para preparar la edición.
   * No modifica el estado compartido mientras se completa el formulario.
   */
  @state()
  private editingTask: Task | undefined = undefined;

  /** La presencia de un identificador indica una solicitud de edición. */
  private get isEditing(): boolean {
    return this.params.id !== undefined;
  }

  /**
   * Actualiza las categorías y prepara un formulario limpio o una copia
   * de los datos existentes, sin conservar borradores de visitas anteriores.
   */
  async onPageEnter(): Promise<void> {
    this.categories = getCategories();
    this.errorMessage = "";

    // Limpia la selección anterior o consulta la tarea solicitada para editar.
    const id = this.params.id;
    this.editingTask = id === undefined ? undefined : getTaskById(id);

    if (id !== undefined && this.editingTask === undefined) {
      this.errorMessage = "La tarea que intentas editar no existe.";
    }

    // Espera a que Lit termine de representar el formulario.
    await this.updateComplete;

    const form = this.renderRoot.querySelector("form");
    if (form instanceof HTMLFormElement) {
      form.reset();

      // Copia el título al campo sin modificar la tarea guardada.
      const titleInput = form.elements.namedItem("title");
      if (titleInput instanceof HTMLInputElement) {
        titleInput.value = this.editingTask?.title ?? "";
      }

      // Copia la categoría al selector; el valor vacío representa «Sin categoría».
      const categorySelect = form.elements.namedItem("categoryId");
      if (categorySelect instanceof HTMLSelectElement) {
        categorySelect.value = this.editingTask?.categoryId ?? "";
      }
    }
  }

  /** Procesa el borrador y solicita su creación o actualización al estado compartido. */
  private handleTaskSubmit(event: SubmitEvent): void {
    event.preventDefault();

    // Una solicitud de edición inválida nunca debe terminar creando otra tarea.
    if (this.isEditing && this.editingTask === undefined) {
      this.errorMessage = "La tarea que intentas editar no existe.";
      return;
    }

    const form = event.currentTarget;

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const formData = new FormData(form);
    const title = formData.get("title");
    const categoryId = formData.get("categoryId");

    // FormData admite texto, archivos o valores ausentes; aquí esperamos texto.
    if (typeof title !== "string" || typeof categoryId !== "string") {
      return;
    }

    // El formulario aporta los datos editables; createTask generará el resto.
    const input: CreateTaskInput = {
      title,
    };

    // El selector usa "" para «Sin categoría»; el modelo omite esa propiedad.
    if (categoryId !== "") {
      input.categoryId = categoryId;
    }

    // La presencia del identificador determina qué operación se solicita.
    const id = this.params.id;
    const result =
      id === undefined
        ? createTask(input)
        : updateTask(id, input);

    if (!result.success) {
      this.errorMessage = result.error;
      return;
    }

    this.errorMessage = "";

    // Limpia el borrador confirmado antes de volver al listado actualizado.
    form.reset();
    this.pageController.navigate("tasks");
  }

	/** Muestra el formulario y adapta sus textos y disponibilidad al modo actual. */
	render() {
		return html`
			<h1>${this.isEditing ? "Editar tarea" : "Crear tarea"}</h1>
			<p>
        ${this.isEditing
          ? "Modifica el título o la categoría y guarda los cambios."
          : "Introduce los datos de tu nueva tarea."}
      </p>
      <!-- El borrador permanece en los campos hasta confirmar el guardado. -->
      <form @submit=${this.handleTaskSubmit}>
        <!-- Impide editar cuando el identificador no corresponde a una tarea. -->
        <fieldset ?disabled=${this.isEditing && this.editingTask === undefined}>
        <label for="task-title">Título de la tarea</label>
        <input id="task-title" name="title" type="text" required />

        <label for="task-category">Categoría</label>
        <select id="task-category" name="categoryId">
          <option value="">Sin categoría</option>
          ${this.categories.map(
            (category) => html`
              <option value=${category.id}>${category.name}</option>
            `,
          )}
        </select>
        <button type="submit">
          ${this.isEditing ? "Actualizar tarea" : "Crear tarea"}
        </button>
        </fieldset>
      </form>
      <!-- La región permanece disponible para anunciar errores de validación. -->
      <p role="alert">${this.errorMessage}</p>
      <!-- Cancelar vuelve al listado sin guardar los cambios del formulario. -->
      <button
        type="button"
        @click=${() => this.pageController.navigate("tasks")}
      >
        Cancelar
      </button>
		`;
	}
}
