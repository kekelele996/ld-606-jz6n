import { Component, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { ConflictBadge } from "../components/common/ConflictBadge";
import { BerthTimeline } from "../components/common/BerthTimeline";
import { BerthPlanStore } from "../stores/BerthPlanStore";
import { BerthStore } from "../stores/BerthStore";
import { VesselStore } from "../stores/VesselStore";
import { useBerthConflict } from "../hooks/useBerthConflict";
import { BerthStatusText } from "../constants/entityText";
import { formatPlanTime, formatMeters } from "../utils/formatters";

// 港口运行总览：列出受冲突影响的计划，并展示各泊位占用数字（改派后数字同步更新）
@Component({
  selector: "app-dashboard-page",
  standalone: true,
  imports: [CommonModule, StatCard, StatusBadge, ConflictBadge, BerthTimeline],
  templateUrl: "./DashboardPage.html"
})
export class DashboardPage {
  private berthPlanStore = inject(BerthPlanStore);
  private berthStore = inject(BerthStore);
  private vesselStore = inject(VesselStore);
  private router = inject(Router);

  private conflictApi = useBerthConflict(this.berthPlanStore.rows, this.berthStore.rows, this.vesselStore.rows);

  readonly plans = this.berthPlanStore.rows;
  readonly berths = this.berthStore.rows;
  readonly vessels = this.vesselStore.rows;
  readonly affectedPlans = this.conflictApi.affectedPlans;
  readonly occupancyByBerth = this.conflictApi.occupancyByBerth;
  readonly totalOccupancy = this.conflictApi.totalOccupancy;

  readonly approvedCount = computed(() => this.plans().filter((plan) => plan.status === "APPROVED").length);
  readonly criticalCount = computed(
    () => this.affectedPlans().filter((plan) => plan.conflict_severity === "CRITICAL").length
  );

  vesselName(vesselId: number): string {
    return this.vessels().find((vessel) => vessel.id === vesselId)?.vessel_name ?? `船舶 #${vesselId}`;
  }

  otherVesselName(planId: number): string {
    const other = this.plans().find((plan) => plan.id === planId);
    return other ? this.vesselName(other.vessel_id) : `计划 #${planId}`;
  }

  berthCode(berthId: number): string {
    return this.berths().find((berth) => berth.id === berthId)?.berth_code ?? `泊位 #${berthId}`;
  }

  berthStatusText(status: string): string {
    return BerthStatusText[status] ?? status;
  }

  occupancyOf(berthId: number): number {
    return this.occupancyByBerth().get(berthId) ?? 0;
  }

  goBerths(): void {
    this.router.navigate(["/berths"]);
  }

  goConflict(planId: number): void {
    this.router.navigate(["/berths"], { queryParams: { plan: planId } });
  }

  formatTime = formatPlanTime;
  formatMeters = formatMeters;
}
