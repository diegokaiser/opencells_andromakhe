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
];
