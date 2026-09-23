import { Component, Input } from "@angular/core";
import { ConflictSeverityText } from "../../constants/ConflictSeverity";
import type { BerthPlanConflict } from "../../types/Conflict";

@Component({
  selector: "conflict-badge",
  standalone: true,
  template: `
    <span class="conflict-badge" [class]="'conflict-badge sev-' + conflict.severity.toLowerCase()" [title]="conflict.reason">
      与计划#{{ conflict.other_plan_id }}（{{ conflict.other_vessel_name }}）冲突 · {{ severityText }} · {{ conflict.overlap_hours }}h
    </span>
  `
})
export class ConflictBadge {
  @Input({ required: true }) conflict!: BerthPlanConflict;

  get severityText(): string {
    return ConflictSeverityText[this.conflict.severity];
  }
}
