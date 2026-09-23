import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { listVessel } from "../api/Vessel";
import { formatDate } from "../utils/formatters";
import type { Vessel } from "../types/Vessel";

@Component({
  selector: "app-vessels",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="panel wide">
      <h2>船舶预报（{{ vessels.length }}）</h2>
      <table class="grid">
        <thead><tr><th>船名</th><th>IMO</th><th>承运人</th><th>船长(m)</th><th>吃水(m)</th><th>ETA</th><th>ETD</th><th>状态</th></tr></thead>
        <tbody>
          <tr *ngFor="let vessel of vessels">
            <td>{{ vessel.vessel_name }}</td>
            <td>{{ vessel.imo_no }}</td>
            <td>{{ vessel.carrier }}</td>
            <td>{{ vessel.length_m }}</td>
            <td>{{ vessel.draft_m }}</td>
            <td>{{ fmt(vessel.eta) }}</td>
            <td>{{ fmt(vessel.etd) }}</td>
            <td><span class="badge tone-approved">{{ vessel.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </section>
  `
})
export class VesselsPage implements OnInit {
  vessels: Vessel[] = [];
  readonly fmt = formatDate;

  async ngOnInit(): Promise<void> {
    this.vessels = await listVessel();
  }
}
