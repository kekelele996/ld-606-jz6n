import { Component, Input } from "@angular/core";
import { BerthPlanStatusText, type BerthPlanStatus } from "../../constants/BerthPlanStatus";

@Component({
  selector: "status-badge",
  standalone: true,
  template: `<span class="badge" [class]="'badge tone-' + status.toLowerCase()">{{ label }}</span>`
})
export class StatusBadge {
  @Input() status = "";
  @Input() kind: "berthPlan" | "generic" = "berthPlan";

  get label(): string {
    if (this.kind === "berthPlan") {
      return BerthPlanStatusText[this.status as BerthPlanStatus] ?? this.status;
    }
    return this.status;
  }
}
