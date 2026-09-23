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
  { path: "dashboard", component: DashboardPage, title: "港口运行总览" },
  { path: "vessels", component: VesselsPage, title: "船舶预报" },
  { path: "berths", component: BerthsPage, title: "泊位计划" },
  { path: "yard", component: YardPage, title: "堆场箱位" },
  { path: "tasks", component: TasksPage, title: "作业派工" },
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  { path: "**", redirectTo: "dashboard" }
];
