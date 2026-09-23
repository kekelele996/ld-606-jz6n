import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-tasks-page",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="simple-page">
      <header class="page-head"><div><p class="eyebrow">task</p><h1>作业派工</h1><p class="subtitle">装卸任务派工入口（与本次冲突处置无直接关系）</p></div></header>
      <section class="panel"><p>作业任务派工入口。</p></section>
    </section>
  `
})
export class TasksPage {}
