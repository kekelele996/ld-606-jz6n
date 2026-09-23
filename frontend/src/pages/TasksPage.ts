import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { mockData } from "../mocks/seedData";
import { formatDate } from "../utils/formatters";

@Component({
  selector: "app-tasks",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="panel wide">
      <h2>作业派工</h2>
      <table class="grid">
        <thead><tr><th>任务</th><th>靠泊计划</th><th>类型</th><th>队伍</th><th>计划开始</th><th>状态</th></tr></thead>
        <tbody>
          <tr *ngFor="let task of tasks">
            <td>#{{ task.id }}</td>
            <td>计划#{{ task.berth_plan_id }}</td>
            <td>{{ task.task_type }}</td>
            <td>{{ task.team_id }} 队</td>
            <td>{{ fmt(task.planned_start) }}</td>
            <td><span class="badge" [class]="'badge tone-' + task.status.toLowerCase()">{{ task.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </section>
  `
})
export class TasksPage {
  tasks = mockData.workTask;
  readonly fmt = formatDate;
}
