import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { StatusBadge } from "../components/common/StatusBadge";
import { ConflictBadge } from "../components/common/ConflictBadge";
import { BerthTimeline } from "../components/common/BerthTimeline";
import { berthPlanStore } from "../stores/BerthPlanStore";
import { berthStore } from "../stores/BerthStore";
import { vesselStore } from "../stores/VesselStore";
import { formatDate, formatPercent } from "../utils/formatters";
import { occupiedBerthIds } from "../utils/berthConflicts";
import type { Berth } from "../types/Berth";
import type { BerthPlan } from "../types/BerthPlan";
import type { BerthOverview, BerthPlanConflict } from "../types/Conflict";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, StatusBadge, ConflictBadge, BerthTimeline],
  template: `
    <section class="metrics">
      <div class="stat"><span>泊位总数</span><strong>{{ overview?.occupancy?.total_berths ?? "-" }}</strong></div>
      <div class="stat"><span>当前占用泊位</span><strong>{{ overview?.occupancy?.occupied_berths ?? "-" }}</strong></div>
      <div class="stat"><span>泊位占用率</span><strong>{{ occupancyRate }}</strong></div>
      <div class="stat alert"><span>受影响计划</span><strong>{{ overview?.conflict_plan_count ?? "-" }}</strong></div>
    </section>

    <section class="panel wide">
      <h2>受影响靠泊计划（{{ conflicts.length }} 条重叠）</h2>
      <p class="empty" *ngIf="conflicts.length === 0">当前没有同泊位时间重叠的计划</p>
      <table class="grid" *ngIf="conflicts.length">
        <thead>
          <tr><th>计划</th><th>船舶</th><th>泊位</th><th>计划窗口</th><th>状态</th><th>冲突对象</th><th>原因</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let entry of conflicts">
            <td>#{{ entry.plan_id }}</td>
            <td>{{ entry.vessel_name }}</td>
            <td>{{ entry.berth_code }}</td>
            <td>{{ windowOf(entry.plan_id) }}</td>
            <td><status-badge [status]="statusOf(entry.plan_id)"></status-badge></td>
            <td><conflict-badge [conflict]="entry"></conflict-badge></td>
            <td class="reason">{{ entry.reason }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="panel wide">
      <h2>当前占用泊位</h2>
      <p class="empty" *ngIf="occupiedBerths.length === 0">当前没有进行中的靠泊窗口</p>
      <div class="berth-block" *ngFor="let berth of occupiedBerths">
        <h3>{{ berth.berth_code }} · {{ berth.length_m }}m</h3>
        <berth-timeline [plans]="plansOn(berth.id)" [conflicts]="conflicts" [vessels]="vessels"></berth-timeline>
      </div>
    </section>
  `
})
export class DashboardPage implements OnInit {
  readonly fmt = formatDate;

  get overview(): BerthOverview | null {
    return berthPlanStore.overview;
  }

  get conflicts(): BerthPlanConflict[] {
    return berthPlanStore.conflicts;
  }

  get vessels() {
    return vesselStore.rows;
  }

  get occupancyRate(): string {
    return this.overview ? formatPercent(this.overview.occupancy.occupancy_rate) : "-";
  }

  get occupiedBerths(): Berth[] {
    const occupied = occupiedBerthIds(berthPlanStore.rows);
    return berthStore.rows.filter((berth) => occupied.has(berth.id));
  }

  async ngOnInit(): Promise<void> {
    await Promise.all([berthPlanStore.refresh(), berthStore.refresh(), vesselStore.refresh()]);
  }

  plansOn(berthId: number): BerthPlan[] {
    return berthPlanStore.rows.filter((plan) => plan.berth_id === berthId);
  }

  statusOf(planId: number): string {
    return berthPlanStore.rows.find((plan) => plan.id === planId)?.status ?? "";
  }

  windowOf(planId: number): string {
    const plan = berthPlanStore.rows.find((row) => row.id === planId);
    return plan ? `${formatDate(plan.planned_arrival)} → ${formatDate(plan.planned_departure)}` : "-";
  }
}
