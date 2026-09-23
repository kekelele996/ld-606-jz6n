import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { mockData } from "../mocks/seedData";

@Component({
  selector: "app-yard",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="panel wide">
      <h2>堆场箱位</h2>
      <table class="grid">
        <thead><tr><th>箱区</th><th>排</th><th>贝</th><th>层</th><th>箱号</th><th>状态</th><th>货类</th></tr></thead>
        <tbody>
          <tr *ngFor="let slot of slots">
            <td>{{ slot.yard_area }}</td>
            <td>{{ slot.row_no }}</td>
            <td>{{ slot.bay_no }}</td>
            <td>{{ slot.tier_no }}</td>
            <td>{{ slot.container_no || "-" }}</td>
            <td><span class="badge" [class]="'badge tone-' + slot.slot_status.toLowerCase()">{{ slot.slot_status }}</span></td>
            <td>{{ slot.cargo_type }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  `
})
export class YardPage {
  slots = mockData.yardSlot;
}
