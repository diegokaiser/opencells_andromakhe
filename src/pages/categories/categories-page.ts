import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { Category } from "../../models/category.ts";

/**
 * Página destinada a listar y crear categorías propias.
 * Reúne ambas acciones para mantener sencilla su gestión.
 */
@customElement("categories-page")
export class CategoriesPage extends LitElement {
	/** Colección interna cuya actualización debe reflejarse en el listado. */
	@state()
	private categories: Category[] = [];

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

		const name = categoryName.trim();

		// Explica por qué un nombre compuesto solo por espacios no es válido.
		if (name.length === 0) {
			this.errorMessage = "Escribe un nombre que no contenga solo espacios.";
			return;
		}

		// Evita categorías equivalentes por diferencias de mayúsculas y minúsculas.
		const alreadyExists = this.categories.some(
			(category) => category.name.toLowerCase() === name.toLowerCase(),
		);

		if (alreadyExists) {
			this.errorMessage = "Ya existe una categoría con ese nombre.";
			return;
		}

		this.errorMessage = "";

		// El identificador permanece estable aunque cambie el nombre visible.
		const category: Category = {
			id: crypto.randomUUID(),
			name,
		};

		// Asignamos un array nuevo para que Lit detecte el cambio y actualice la lista.
		this.categories = [...this.categories, category];

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
