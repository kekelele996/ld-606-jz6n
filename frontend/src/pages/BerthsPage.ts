import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { PlanCard } from "../components/common/PlanCard";
import { BerthTimeline } from "../components/common/BerthTimeline";
import { ConflictBadge } from "../components/common/ConflictBadge";
import { BerthPlanStore } from "../stores/BerthPlanStore";
import { BerthStore } from "../stores/BerthStore";
import { VesselStore } from "../stores/VesselStore";
import { useBerthConflict } from "../hooks/useBerthConflict";
import type { BerthPlan } from "../types/BerthPlan";
import type { BerthReassignCandidate } from "../types/BerthReassignCandidate";
import { BerthStatusText, BerthTypeText } from "../constants/entityText";
import { formatMeters } from "../utils/formatters";

// 泊位计划页：按泊位分组展示计划卡片，卡片标出冲突对象/严重程度，调度员可直接改派
@Component({
  selector: "app-berths-page",
  standalone: true,
  imports: [CommonModule, PlanCard, BerthTimeline, ConflictBadge],
  templateUrl: "./BerthsPage.html"
})
export class BerthsPage {
  readonly berthPlanStore = inject(BerthPlanStore);
  readonly berthStore = inject(BerthStore);
  readonly vesselStore = inject(VesselStore);
  private route = inject(ActivatedRoute);

  private conflictApi = useBerthConflict(this.berthPlanStore.rows, this.berthStore.rows, this.vesselStore.rows);

  readonly expandedPlanId = signal<number | null>(null);
  readonly chosenBerthByPlan = signal<Map<number, number>>(new Map());
  readonly messageByPlan = signal<Map<number, string>>(new Map());
  readonly errorByPlan = signal<Map<number, boolean>>(new Map());

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const planId = Number(params.get("plan"));
      if (planId) {
        this.expandedPlanId.set(planId);
      }
    });
  }

  get plans() {
    return this.berthPlanStore.rows;
  }

  get berths() {
    return this.berthStore.rows;
  }

  get vessels() {
    return this.vesselStore.rows;
  }

  get conflictCount() {
    return this.conflictApi.affectedCount;
  }

  plansOfBerth(berthId: number): BerthPlan[] {
    return this.plans()
      .filter((plan) => plan.berth_id === berthId)
      .sort((a, b) => new Date(a.planned_arrival).getTime() - new Date(b.planned_arrival).getTime());
  }

  otherPlanOf(plan: BerthPlan): BerthPlan | null {
    if (plan.conflict_plan_id == null) {
      return null;
    }
    return this.plans().find((row) => row.id === plan.conflict_plan_id) ?? null;
  }

  candidatesOf(plan: BerthPlan): BerthReassignCandidate[] {
    return this.conflictApi.candidatesFor(plan.id);
  }

  isExpanded(planId: number): boolean {
    return this.expandedPlanId() === planId;
  }

  chosenBerthId(planId: number): number | null {
    return this.chosenBerthByPlan().get(planId) ?? null;
  }

  messageOf(planId: number): string {
    return this.messageByPlan().get(planId) ?? "";
  }

  isError(planId: number): boolean {
    return this.errorByPlan().get(planId) ?? false;
  }

  onToggle(planId: number): void {
    this.expandedPlanId.set(this.expandedPlanId() === planId ? null : planId);
    const next = new Map(this.messageByPlan());
    next.delete(planId);
    this.messageByPlan.set(next);
    const errors = new Map(this.errorByPlan());
    errors.delete(planId);
    this.errorByPlan.set(errors);
  }

  onChoose(event: { planId: number; berthId: number }): void {
    const next = new Map(this.chosenBerthByPlan());
    next.set(event.planId, event.berthId);
    this.chosenBerthByPlan.set(next);
  }

  async onSubmit(event: { planId: number; berthId: number }): Promise<void> {
    const plan = this.plans().find((row) => row.id === event.planId);
    const berth = this.berths().find((row) => row.id === event.berthId);
    const vessel = plan ? this.vessels().find((row) => row.id === plan.vessel_id) : undefined;
    if (!plan || !berth || !vessel) {
      return;
    }
    const result = await this.berthPlanStore.reassign(event.planId, event.berthId, berth.berth_code, vessel.length_m, berth.length_m);
    const messages = new Map(this.messageByPlan());
    const errors = new Map(this.errorByPlan());
    if (result.ok) {
      const updated = this.berthPlanStore.getById(event.planId);
      messages.set(
        event.planId,
        updated?.status === "APPROVED"
          ? "改派成功，该计划时间窗无重叠，已进入已批准。"
          : `提交完成，但新泊位仍有时间重叠，已继续标记为${updated?.conflict_severity === "CRITICAL" ? "严重" : updated?.conflict_severity === "HIGH" ? "明显" : "轻度"}冲突并写明原因。`
      );
      errors.set(event.planId, updated?.status !== "APPROVED");
      this.expandedPlanId.set(event.planId);
    } else {
      messages.set(event.planId, result.message ?? "改派失败");
      errors.set(event.planId, true);
    }
    this.messageByPlan.set(messages);
    this.errorByPlan.set(errors);
  }

  onCancel(planId: number): void {
    this.expandedPlanId.set(null);
    const next = new Map(this.chosenBerthByPlan());
    next.delete(planId);
    this.chosenBerthByPlan.set(next);
  }

  get submitting(): boolean {
    return this.berthPlanStore.submitting();
  }

  berthTypeText(type: string): string {
    return BerthTypeText[type] ?? type;
  }

  berthStatusText(status: string): string {
    return BerthStatusText[status] ?? status;
  }

  formatMeters = formatMeters;
}
