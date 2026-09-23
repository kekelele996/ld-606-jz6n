import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import type { BerthPlan } from "../../types/BerthPlan";
import type { Berth } from "../../types/Berth";
import type { Vessel } from "../../types/Vessel";
import type { BerthReassignCandidate } from "../../types/BerthReassignCandidate";
import { StatusBadge } from "./StatusBadge";
import { ConflictBadge } from "./ConflictBadge";
import { PriorityText, VesselStatusText } from "../../constants/entityText";
import { formatPlanTime, formatMeters, formatConflictTarget, formatReassignNote } from "../../utils/formatters";

// 泊位页计划卡片：标出冲突对象、严重程度、冲突原因，并承载改派操作
@Component({
  selector: "app-plan-card",
  standalone: true,
  imports: [CommonModule, StatusBadge, ConflictBadge],
  templateUrl: "./PlanCard.html"
})
export class PlanCard {
  @Input() plan!: BerthPlan;
  @Input() otherPlan: BerthPlan | null = null;
  @Input() allPlans: BerthPlan[] = [];
  @Input() berths: Berth[] = [];
  @Input() vessels: Vessel[] = [];
  @Input() candidates: BerthReassignCandidate[] = [];
  @Input() expanded = false;
  @Input() submitting = false;
  @Input() reassignMessage = "";
  @Input() reassignError = false;
  @Input() chosenBerthId: number | null = null;

  @Output() toggle = new EventEmitter<number>();
  @Output() chooseBerth = new EventEmitter<{ planId: number; berthId: number }>();
  @Output() submit = new EventEmitter<{ planId: number; berthId: number }>();
  @Output() cancel = new EventEmitter<number>();

  get vessel(): Vessel | undefined {
    return this.vessels.find((row) => row.id === this.plan.vessel_id);
  }

  get berth(): Berth | undefined {
    return this.berths.find((row) => row.id === this.plan.berth_id);
  }

  get berthMap(): Map<number, Berth> {
    return new Map(this.berths.map((berth) => [berth.id, berth]));
  }

  get vesselMap(): Map<number, Vessel> {
    return new Map(this.vessels.map((vessel) => [vessel.id, vessel]));
  }

  get conflictTarget(): string {
    return formatConflictTarget(this.plan, this.allPlans, this.vesselMap, this.berthMap);
  }

  get otherVesselName(): string {
    if (!this.otherPlan) {
      return "";
    }
    return this.vesselMap.get(this.otherPlan.vessel_id)?.vessel_name ?? "未知船舶";
  }

  get otherBerthCode(): string {
    if (!this.otherPlan) {
      return "";
    }
    return this.berthMap.get(this.otherPlan.berth_id)?.berth_code ?? "未知泊位";
  }

  get otherTimeRange(): string {
    if (!this.otherPlan) {
      return "";
    }
    return `${formatPlanTime(this.otherPlan.planned_arrival)} - ${formatPlanTime(this.otherPlan.planned_departure)}`;
  }

  get reassignNote(): string {
    return formatReassignNote(this.plan, this.berthMap);
  }

  get priorityText(): string {
    return PriorityText[this.plan.priority] ?? this.plan.priority;
  }

  get vesselStatusText(): string {
    return VesselStatusText[this.vessel?.status ?? ""] ?? this.vessel?.status ?? "";
  }

  get canSubmit(): boolean {
    return this.chosenBerthId != null && !this.submitting;
  }

  onToggle(): void {
    this.toggle.emit(this.plan.id);
  }

  onChoose(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    this.chooseBerth.emit({ planId: this.plan.id, berthId: id });
  }

  onSubmit(): void {
    if (this.chosenBerthId != null) {
      this.submit.emit({ planId: this.plan.id, berthId: this.chosenBerthId });
    }
  }

  onCancel(): void {
    this.cancel.emit(this.plan.id);
  }

  candidateHint(candidate: BerthReassignCandidate): string {
    if (!candidate.suitable) {
      return candidate.length_m < (this.vessel?.length_m ?? 0) ? "长度不足" : "水深不足";
    }
    if (candidate.current_status === "MAINTENANCE") {
      return "维护中";
    }
    if (candidate.blocking_plan_id != null) {
      return `与计划 #${candidate.blocking_plan_id} 时间重叠`;
    }
    return "空闲且长度合适";
  }

  formatTime = formatPlanTime;
  formatMeters = formatMeters;
}
