import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { Category } from "../../models/category.js";
import { createCategory, getCategories } from "../../state/task-state.js";
import { PageController } from "@open-cells/page-controller";
import { CATEGORIES_CHANGED } from "../../state/channels.js";

/**
 * Página destinada a listar y crear categorías propias.
 * Reúne ambas acciones para mantener sencilla su gestión.
 */
@customElement("categories-page")
export class CategoriesPage extends LitElement {
  /** Proporciona la publicación de avisos mediante canales de OpenCells. */
  pageController = new PageController(this);

	/** Colección interna cuya actualización debe reflejarse en el listado. */
	@state()
	private categories: Category[] = getCategories();

	/** Explicación del error de validación; vacío significa que no hay error. */
	@state()
	private errorMessage: string = "";

	/**
	 * Intercepta el envío para gestionar la creación dentro de la aplicación.
	 * Evita la navegación predeterminada y la pérdida del estado en memoria.
	 */
	private handleCategorySubmit(event: SubmitEvent): void {
		event.preventDefault();

		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement)) {
			return;
		}

		const formData = new FormData(form);
		const categoryName = formData.get("category-name");

		// FormData también admite archivos o valores ausentes; esperamos texto.
		if (typeof categoryName !== "string") {
			return;
		}

		// El módulo compartido valida y crea; la página presenta el resultado.
    const result = createCategory(categoryName);

    if (!result.success) {
      this.errorMessage = result.error;
      return;
    }

    // Comunica únicamente una creación confirmada, sin publicar en caso de error.
    this.pageController.publish(CATEGORIES_CHANGED, {});

    this.errorMessage = "";
    this.categories = getCategories();
    form.reset();
	}

	/** Muestra el formulario, los errores de validación y las categorías creadas. */
	render() {
		return html`
			<h1>Mis categorías</h1>
			<p>Crea categorías para organizar tus tareas.</p>
			<!-- Formulario de creación; la etiqueta proporciona un nombre accesible al campo. -->
			<form @submit=${this.handleCategorySubmit}>
				<label for="category-name">Nombre de la categoría</label>
				<input id="category-name" name="category-name" type="text" required />
				<button type="submit">Crear categoría</button>
			</form>
			<!-- Anuncia los errores de validación sin desplazar el foco del formulario. -->
			<p role="alert">${this.errorMessage}</p>
			${this.categories.length === 0
				? html`<p>Todavía no tienes categorías creadas.</p>`
				: html`
						<ul>
							${this.categories.map(
								(category) => html`<li>${category.name}</li>`,
							)}
						</ul>
					`}
		`;
	}
}
