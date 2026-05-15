import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartType } from 'chart.js';
import { UserService } from '../users/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {

  adminCount = 0;
  userCount = 0;

  pieChartType: ChartType = 'pie';

  stats: { role: string, count: number }[] = [];

  pieChartData: any = {
    labels: [],
    datasets: [{ data: [] }]
  };

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.loadStats();
  }

  // Dans dashboard.component.ts, modifiez loadStats() :

  loadStats() {
    this.userService.getStats().subscribe((res: any) => {

      this.stats = res;

      this.pieChartData = {
        labels: res.map((r: any) => r.role),
        datasets: [{
          data: res.map((r: any) => r.count),
          backgroundColor: this.generateColors(res.length),
          hoverOffset: 20
        }]
      };
    });
  }
  generateColors(size: number): string[] {
    const palette = [
      '#4f46e5',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#06b6d4',
      '#a855f7',
      '#84cc16'
    ];

    return Array.from({ length: size }, (_, i) => palette[i % palette.length]);
  }
  // Optionnel : Ajoutez des options pour rendre le graphique "Donut" (plus moderne)
  public pieChartOptions: any = {
    plugins: {
      legend: {
        display: false // On cache la légende car on fait nos propres cartes à côté
      }
    },
    cutout: '70%', // Transforme le Pie en Donut
  };
}