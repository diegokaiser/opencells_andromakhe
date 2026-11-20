import { RouteDefinition } from "@open-cells/core/types";

export const routes: RouteDefinition[] = [
	{
		path: "/",
		name: "tasks",
		component: "tasks-page",
		action: async () => {
			await import("../pages/tasks/tasks-page.js");
		},
	},
	{
		path: "/task/:id",
		name: "task",
		component: "task-detail-page",
		action: async () => {
			await import("../pages/task-detail/task-detail-page.js");
		},
	},
  {
		path: "/tasks/new",
		name: "create-task",
		component: "create-task-page",
		action: async () => {
			await import("../pages/create-task-page/create-task-page.js");
		},
	},
	{
		path: "/categories",
		name: "categories",
		component: "categories-page",
		action: async () => {
			await import("../pages/categories/categories-page.js");
		},
	},
  {
    // La etiqueta propia permite asociar los hooks a la ruta de edición.
    path: "/tasks/:id/edit",
    name: "edit-task",
    component: "edit-task-page",
    action: async () => {
      await import("../pages/edit-task-page/edit-task-page.js");
    },
  },
];
