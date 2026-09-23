import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { VesselStore } from "../stores/VesselStore";
import { BerthPlanStore } from "../stores/BerthPlanStore";
import { VesselStatusText } from "../constants/entityText";
import { formatPlanTime, formatMeters } from "../utils/formatters";

@Component({
  selector: "app-vessels-page",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="simple-page">
      <header class="page-head"><div><p class="eyebrow">vessel</p><h1>船舶预报</h1><p class="subtitle">到港船舶及其靠泊计划</p></div></header>
      <section class="panel">
        <table class="data-table">
          <thead><tr><th>船名</th><th>IMO</th><th>船公司</th><th>船长</th><th>吃水</th><th>ETA</th><th>状态</th><th>靠泊计划</th></tr></thead>
          <tbody>
            <tr *ngFor="let vessel of vessels()">
              <td><strong>{{ vessel.vessel_name }}</strong></td>
              <td>{{ vessel.imo_no }}</td>
              <td>{{ vessel.carrier }}</td>
              <td>{{ formatMeters(vessel.length_m) }}</td>
              <td>{{ vessel.draft_m }} m</td>
              <td>{{ formatTime(vessel.eta) }}</td>
              <td>{{ vesselStatus(vessel.status) }}</td>
              <td>
                <span *ngFor="let plan of plansOf(vessel.id)" class="plan-chip">#{{ plan.id }} {{ formatTime(plan.planned_arrival) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </section>
  `
})
export class VesselsPage {
  private vesselStore = inject(VesselStore);
  private berthPlanStore = inject(BerthPlanStore);

  vessels = this.vesselStore.rows;
  allPlans = this.berthPlanStore.rows;

  plansOf(vesselId: number) {
    return this.allPlans().filter((plan) => plan.vessel_id === vesselId);
  }

  vesselStatus(status: string): string {
    return VesselStatusText[status] ?? status;
  }

  formatTime = formatPlanTime;
  formatMeters = formatMeters;
}
