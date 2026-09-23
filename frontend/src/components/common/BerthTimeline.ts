import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { StatusBadge } from "./StatusBadge";
import { ConflictBadge } from "./ConflictBadge";
import { formatDate } from "../../utils/formatters";
import type { BerthPlan } from "../../types/BerthPlan";
import type { Vessel } from "../../types/Vessel";
import type { BerthPlanConflict } from "../../types/Conflict";

// 泊位计划卡片列表：总览与泊位页共用；reassignable 时冲突计划卡片带“改派”入口。
@Component({
  selector: "berth-timeline",
  standalone: true,
  imports: [CommonModule, StatusBadge, ConflictBadge],
  template: `
    <div class="timeline" *ngIf="plans.length; else empty">
      <article class="plan-card" *ngFor="let plan of plans" [class.conflicted]="conflictsOf(plan.id).length > 0">
        <header>
          <strong>计划#{{ plan.id }} · {{ vesselName(plan.vessel_id) }}</strong>
          <status-badge [status]="plan.status"></status-badge>
        </header>
        <p class="window">{{ fmt(plan.planned_arrival) }} → {{ fmt(plan.planned_departure) }}</p>
        <div class="conflicts" *ngIf="conflictsOf(plan.id).length">
          <conflict-badge *ngFor="let entry of conflictsOf(plan.id)" [conflict]="entry"></conflict-badge>
        </div>
        <p class="reason" *ngIf="plan.conflict_reason">原因：{{ plan.conflict_reason }}</p>
        <footer *ngIf="reassignable && plan.status === 'CONFLICT'">
          <button type="button" class="action" (click)="reassign.emit(plan)">改派泊位</button>
        </footer>
      </article>
    </div>
    <ng-template #empty><p class="empty">该泊位暂无靠泊计划</p></ng-template>
  `
})
export class BerthTimeline {
  @Input() plans: BerthPlan[] = [];
  @Input() conflicts: BerthPlanConflict[] = [];
  @Input() vessels: Vessel[] = [];
  @Input() reassignable = false;
  @Output() reassign = new EventEmitter<BerthPlan>();

  readonly fmt = formatDate;

  conflictsOf(planId: number): BerthPlanConflict[] {
    return this.conflicts.filter((entry) => entry.plan_id === planId);
  }

  vesselName(vesselId: number): string {
    return this.vessels.find((vessel) => vessel.id === vesselId)?.vessel_name ?? `#${vesselId}`;
  }
}
