import { customElement } from "lit/decorators.js";
import { CreateTaskPage } from "../create-task-page/create-task-page.js";

/**
 * Reutiliza el formulario con una etiqueta propia para que PageController
 * vincule sus hooks al nombre de ruta edit-task.
 */
@customElement("edit-task-page")
export class EditTaskPage extends CreateTaskPage {}
