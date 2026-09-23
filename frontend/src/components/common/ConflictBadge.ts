import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ConflictSeverityText, ConflictSeverityHint } from "../../constants/ConflictSeverity";

// 冲突严重程度徽标：在计划卡片与总览列表共用
@Component({
  selector: "app-conflict-badge",
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="conflict-badge severity-{{ severity }}" [title]="hint">
      <span class="dot"></span>{{ text }}
    </span>
  `
})
export class ConflictBadge {
  @Input() severity: string | null = null;

  get text(): string {
    if (!this.severity) {
      return "无冲突";
    }
    return `${ConflictSeverityText[this.severity as keyof typeof ConflictSeverityText] ?? this.severity}冲突`;
  }

  get hint(): string {
    return this.severity
      ? ConflictSeverityHint[this.severity as keyof typeof ConflictSeverityHint] ?? ""
      : "当前时间窗无泊位冲突";
  }
}
