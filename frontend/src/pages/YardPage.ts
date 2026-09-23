import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-yard-page",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="simple-page">
      <header class="page-head"><div><p class="eyebrow">yard</p><h1>堆场箱位</h1><p class="subtitle">箱位矩阵与占用状态（与本次冲突处置无直接关系）</p></div></header>
      <section class="panel"><p>堆场箱位维护入口。</p></section>
    </section>
  `
})
export class YardPage {}
