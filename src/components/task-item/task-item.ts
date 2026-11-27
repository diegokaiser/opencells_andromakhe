import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Task } from "../../models/task.js";

/**
 * Muestra una tarea y comunica la solicitud de consultar su detalle.
 * La página contenedora decide cómo responder, permitiendo reutilizar
 * el componente sin acoplarlo a las rutas de la aplicación.
 *
 * @fires task-detail-requested - CustomEvent<{ id: string }>;
 * detail.id identifica la tarea cuyo detalle se solicita.
 */
@customElement("task-item")
export class TaskItem extends LitElement {
  /** Superficie independiente que hereda la paleta compartida mediante variables CSS. */
  static styles = css`
    :host {
      display: block;
      padding: 1.25rem;
      border-radius: 1.5rem;
      background: var(--app-surface-dark);
      color: var(--app-text);
    }

    p {
      margin: 0 0 0.5rem;
      font-weight: 600;
      /* Permite ajustar títulos largos sin desbordar la tarjeta. */
      overflow-wrap: anywhere;
    }

    span {
      color: var(--app-text-muted);
    }

    /* Acción secundaria con contraste sobre la tarjeta oscura. */
    button {
      margin-inline-start: 0.75rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--app-border);
      border-radius: 0.75rem;
      background: transparent;
      color: var(--app-text);
      font: inherit;
      cursor: pointer;
    }

    button:hover {
      background: var(--app-surface);
    }

    button:focus-visible {
      outline: 2px solid var(--app-text);
      outline-offset: 3px;
    }
  `;

	/**
	 * Tarea que proporciona la página para mostrar su título y estado.
	 * No se modifica desde este componente.
	 * Sin valor, el componente no mostrará contenido.
	 */
	@property({ attribute: false })
	task: Task | undefined = undefined;

	/**
	 * Solicita abrir el detalle sin decidir cómo se mostrará.
	 * @fires task-detail-requested - CustomEvent con detail: { id: string }.
	 */
	private requestDetail(): void {
		if (this.task === undefined) {
			return;
		}

		this.dispatchEvent(
			new CustomEvent<{ id: string }>("task-detail-requested", {
				detail: { id: this.task.id },
				bubbles: true,
				composed: true,
			}),
		);
	}

	/** Muestra los datos recibidos; evita representar una tarea inexistente. */
	render() {
		if (this.task === undefined) {
			return;
		}

		return html`
			<p>${this.task.title}</p>
			<span>
				Estado: ${this.task.status === "pending" ? "Pendiente" : "Completada"}
			</span>
			<button type="button" @click=${this.requestDetail}>Ver detalle</button>
		`;
	}
}
