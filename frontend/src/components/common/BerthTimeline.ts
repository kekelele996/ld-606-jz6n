import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import type { BerthPlan } from "../../types/BerthPlan";
import type { Berth } from "../../types/Berth";
import { toTime } from "../../utils/berthConflict";

// 共享泊位时间轴：总览页展示占用分布，泊位页展示甘特条
@Component({
  selector: "app-berth-timeline",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./BerthTimeline.html"
})
export class BerthTimeline {
  @Input() berths: Berth[] = [];
  @Input() plans: BerthPlan[] = [];

  rangeStart = toTime("2026-09-24T00:00:00+08:00");
  rangeEnd = toTime("2026-09-28T00:00:00+08:00");

  get days(): string[] {
    return ["09-24", "09-25", "09-26", "09-27"];
  }

  plansOf(berthId: number): Array<BerthPlan & { left: number; width: number }> {
    const span = this.rangeEnd - this.rangeStart;
    return this.plans
      .filter((plan) => plan.berth_id === berthId && !["CANCELLED", "DEPARTED"].includes(plan.status))
      .map((plan) => {
        const start = Math.max(toTime(plan.planned_arrival), this.rangeStart);
        const end = Math.min(toTime(plan.planned_departure), this.rangeEnd);
        return {
          ...plan,
          left: ((start - this.rangeStart) / span) * 100,
          width: Math.max(((end - start) / span) * 100, 0.6)
        };
      });
  }
}
