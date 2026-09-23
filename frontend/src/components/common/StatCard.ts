import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-stat-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat stat-tone-{{ tone }}">
      <span>{{ label }}</span>
      <strong>{{ value }}</strong>
      <small *ngIf="hint">{{ hint }}</small>
    </div>
  `
})
export class StatCard {
  @Input() label = "";
  @Input() value: string | number = 0;
  @Input() hint = "";
  @Input() tone: "neutral" | "danger" | "ok" = "neutral";
}
