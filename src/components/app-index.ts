import { startApp } from "@open-cells/core";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { ElementController } from "@open-cells/element-controller";
import { routes } from "../router/routes.js";
import { styles } from "./app-index.css.js";

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
		return html`
			<header>
				<nav>
					<!-- Acceso compartido al listado mediante la ruta inicial de OpenCells. -->
					<a class="brand-link" href="#!/">Mis tareas</a>
				</nav>
			</header>
			<main role="main" tabindex="-1">
				<!-- El slot proyecta la página dentro del contenido principal compartido. -->
				<slot></slot>
			</main>
		`;
	}
}
