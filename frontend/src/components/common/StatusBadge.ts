import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BerthPlanStatusText } from "../../constants/BerthPlanStatus";

// 共享状态徽标：计划状态统一在这里映射文案与颜色
@Component({
  selector: "app-status-badge",
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge status-{{ tone }}">{{ text }}</span>`
})
export class StatusBadge {
  @Input() status = "";

  get text(): string {
    return BerthPlanStatusText[this.status as keyof typeof BerthPlanStatusText] ?? this.status ?? "—";
  }

  get tone(): string {
    if (this.status === "APPROVED") return "approved";
    if (this.status === "CONFLICT") return "conflict";
    if (this.status === "BERTHING") return "berthing";
    if (this.status === "CANCELLED" || this.status === "DEPARTED") return "muted";
    return "draft";
  }
}
