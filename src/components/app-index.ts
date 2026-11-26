import { startApp } from "@open-cells/core";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { ElementController } from "@open-cells/element-controller";
import { routes } from "../router/routes.js";
import { styles } from "./app-index.css.js";
import { getLoadError } from "../state/task-state.js";

startApp({
	routes,
	mainNode: "app-content",
});

/**
 * Estructura compartida de la aplicación.
 * Mantiene el encabezado y muestra mediante el slot las páginas
 * gestionadas por OpenCells, evitando repetir esa estructura en cada página.
 */
@customElement("app-index")
export class AppIndex extends LitElement {
	elementController = new ElementController(this);

	static styles = styles;

	render() {
    const loadError = getLoadError();
		return html`
			<header>
				<nav>
					<!-- Acceso compartido al listado mediante la ruta inicial de OpenCells. -->
					<a class="brand-link" href="#!/">Mis tareas</a>
					<!-- Acceso a la gestión de categorías desde cualquier página. -->
					<a href="#!/categories">Categorías</a>
				</nav>
			</header>
			<main role="main" tabindex="-1">
        ${loadError === undefined
          ? null
          : html`
              <p role="alert">
                ${loadError}
                Los datos guardados se han conservado sin sobrescribir.
                No se podrán guardar cambios hasta resolver el problema.
              </p>
            `}
				<!-- El slot proyecta la página dentro del contenido principal compartido. -->
				<slot></slot>
			</main>
		`;
	}
}
