import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { BerthTimeline } from "../components/common/BerthTimeline";
import { berthPlanStore } from "../stores/BerthPlanStore";
import { berthStore } from "../stores/BerthStore";
import { vesselStore } from "../stores/VesselStore";
import { ApiError } from "../api/BerthPlan";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { createReassignForm, type ReassignForm } from "../constructors/BerthPlanConstructor";
import { buildReassignOptions, occupiedBerthIds } from "../utils/berthConflicts";
import { formatDate } from "../utils/formatters";
import type { Berth } from "../types/Berth";
import type { BerthPlan } from "../types/BerthPlan";
import type { BerthPlanConflict, BerthReassignOption } from "../types/Conflict";

@Component({
  selector: "app-berths",
  standalone: true,
  imports: [CommonModule, FormsModule, BerthTimeline],
  template: `
    <section class="berth-section" *ngFor="let berth of berths">
      <header class="berth-head">
        <h2>{{ berth.berth_code }}</h2>
        <span class="meta">{{ berth.length_m }}m · 水深 {{ berth.water_depth_m }}m · {{ berth.berth_type }}</span>
        <span class="badge" [class]="isOccupied(berth.id) ? 'badge tone-conflict' : 'badge tone-approved'">
          {{ isOccupied(berth.id) ? "占用中" : "空闲" }}
        </span>
      </header>
      <berth-timeline
        [plans]="plansOn(berth.id)"
        [conflicts]="conflicts"
        [vessels]="vessels"
        [reassignable]="true"
        (reassign)="openReassign($event)"
      ></berth-timeline>
    </section>

    <div class="drawer-backdrop" *ngIf="form" (click)="close()"></div>
    <aside class="drawer" *ngIf="form && selectedPlan">
      <h2>改派计划#{{ form.plan_id }}</h2>
      <p class="drawer-line">船舶：<strong>{{ vesselName(selectedPlan.vessel_id) }}</strong> · 船长 {{ vesselLength(selectedPlan.vessel_id) }}m</p>
      <p class="drawer-line">当前泊位：{{ berthCode(selectedPlan.berth_id) }}</p>
      <p class="drawer-line">窗口：{{ fmt(selectedPlan.planned_arrival) }} → {{ fmt(selectedPlan.planned_departure) }}</p>

      <label class="field">目标泊位（仅列出当前空闲且长度合适的泊位）
        <select [(ngModel)]="form.berth_id" [disabled]="submitting">
          <option [ngValue]="null" disabled>请选择泊位</option>
          <option *ngFor="let option of options" [ngValue]="option.berth.id">
            {{ option.berth.berth_code }} · {{ option.berth.length_m }}m{{ option.window_clear ? "（窗口空闲）" : "（窗口内与计划 #" + option.conflicts_with.join("、#") + " 重叠）" }}
          </option>
        </select>
      </label>

      <p class="warn" *ngIf="selectedOption && !selectedOption.window_clear">
        {{ selectedOption.berth.berth_code }} 在计划窗口内与计划 #{{ selectedOption.conflicts_with.join("、#") }} 时间重叠，
        提交后计划仍会标记为冲突并写明原因。
      </p>
      <p class="empty" *ngIf="options.length === 0">{{ ERROR_MESSAGES.NO_ELIGIBLE_BERTH }}</p>

      <p class="result" *ngIf="resultMessage" [class.error]="resultError" [class.success]="!resultError">{{ resultMessage }}</p>

      <footer class="drawer-actions">
        <button type="button" class="action primary" (click)="submit()" [disabled]="!form.berth_id || submitting">提交改派</button>
        <button type="button" class="action" (click)="close()">关闭</button>
      </footer>
    </aside>
  `
})
export class BerthsPage implements OnInit {
  readonly fmt = formatDate;
  readonly ERROR_MESSAGES = ERROR_MESSAGES;

  form: ReassignForm | null = null;
  options: BerthReassignOption[] = [];
  resultMessage = "";
  resultError = false;
  submitting = false;

  get berths(): Berth[] {
    return berthStore.rows;
  }

  get vessels() {
    return vesselStore.rows;
  }

  get conflicts(): BerthPlanConflict[] {
    return berthPlanStore.conflicts;
  }

  get selectedPlan(): BerthPlan | undefined {
    return this.form ? berthPlanStore.rows.find((plan) => plan.id === this.form?.plan_id) : undefined;
  }

  get selectedOption(): BerthReassignOption | undefined {
    return this.options.find((option) => option.berth.id === this.form?.berth_id);
  }

  async ngOnInit(): Promise<void> {
    await Promise.all([berthPlanStore.refresh(), berthStore.refresh(), vesselStore.refresh()]);
  }

  openReassign(plan: BerthPlan): void {
    this.options = buildReassignOptions(plan, berthPlanStore.rows, berthStore.rows, vesselStore.rows).filter(
      (option) => option.fits_length && option.currently_free
    );
    this.form = createReassignForm(plan.id);
    this.resultMessage = "";
    this.resultError = false;
  }

  close(): void {
    this.form = null;
    this.options = [];
    this.resultMessage = "";
    this.resultError = false;
  }

  async submit(): Promise<void> {
    if (!this.form || this.form.berth_id == null) return;
    this.submitting = true;
    this.resultMessage = "";
    try {
      const result = await berthPlanStore.reassign(this.form.plan_id, {
        berth_id: this.form.berth_id,
        dispatcher_id: selectedDispatcherId
      });
      this.resultMessage = result.message;
      this.resultError = result.plan.status === "CONFLICT";
      // 重新计算候选：占用数字与冲突标记已随 store.refresh 刷新。
      if (this.selectedPlan) {
        this.options = buildReassignOptions(this.selectedPlan, berthPlanStore.rows, berthStore.rows, vesselStore.rows).filter(
          (option) => option.fits_length && option.currently_free
        );
      }
    } catch (err) {
      this.resultError = true;
      this.resultMessage = err instanceof ApiError ? err.message : ERROR_MESSAGES.VALIDATION_FAILED;
    } finally {
      this.submitting = false;
    }
  }

  plansOn(berthId: number): BerthPlan[] {
    return berthPlanStore.rows.filter((plan) => plan.berth_id === berthId);
  }

  isOccupied(berthId: number): boolean {
    return occupiedBerthIds(berthPlanStore.rows).has(berthId);
  }

  vesselName(vesselId: number): string {
    return vesselStore.rows.find((vessel) => vessel.id === vesselId)?.vessel_name ?? `#${vesselId}`;
  }

  vesselLength(vesselId: number): number {
    return vesselStore.rows.find((vessel) => vessel.id === vesselId)?.length_m ?? 0;
  }

  berthCode(berthId: number): string {
    return berthStore.rows.find((berth) => berth.id === berthId)?.berth_code ?? `#${berthId}`;
  }
}

// 本地演示固定以调度员身份提交，后端 authMiddleware 同样落到该身份。
const selectedDispatcherId = 1;
