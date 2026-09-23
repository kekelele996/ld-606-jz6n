import type { Routes } from "@angular/router";
import { DashboardPage } from "../pages/DashboardPage";
import { VesselsPage } from "../pages/VesselsPage";
import { BerthsPage } from "../pages/BerthsPage";
import { YardPage } from "../pages/YardPage";
import { TasksPage } from "../pages/TasksPage";

export const navItems = [
  { name: "港口运行总览", route: "/dashboard" },
  { name: "船舶预报", route: "/vessels" },
  { name: "泊位计划", route: "/berths" },
  { name: "堆场箱位", route: "/yard" },
  { name: "作业派工", route: "/tasks" }
] as const;

export const routes: Routes = [
  { path: "dashboard", component: DashboardPage },
  { path: "vessels", component: VesselsPage },
  { path: "berths", component: BerthsPage },
  { path: "yard", component: YardPage },
  { path: "tasks", component: TasksPage },
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  { path: "**", redirectTo: "dashboard" }
];
