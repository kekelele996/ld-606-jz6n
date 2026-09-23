import { Component, OnInit, inject } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";
import { provideRouter, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { routes, navItems } from "./router/routes";
import { BerthPlanStore } from "./stores/BerthPlanStore";
import { BerthStore } from "./stores/BerthStore";
import { VesselStore } from "./stores/VesselStore";
import "./styles.css";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <aside>
        <div class="brand">港口泊位与<br />堆场协同系统</div>
        <nav>
          <a
            *ngFor="let item of navItems"
            class="nav-item"
            [routerLink]="item.route"
            routerLinkActive="active"
          >{{ item.name }}</a>
        </nav>
        <p class="aside-note">本地种子数据 · 冲突改派自动留存</p>
      </aside>
      <main class="page">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
class AppComponent implements OnInit {
  private berthPlanStore = inject(BerthPlanStore);
  private berthStore = inject(BerthStore);
  private vesselStore = inject(VesselStore);

  navItems = navItems;

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.berthStore.hydrate(),
      this.vesselStore.hydrate(),
      this.berthPlanStore.hydrate()
    ]);
  }
}

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)]
});
