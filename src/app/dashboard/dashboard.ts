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

  pieChartData: any = {
    labels: ['Admins', 'Users'],
    datasets: [{
      data: [0, 0]
    }]
  };

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.loadStats();
  }

  // Dans dashboard.component.ts, modifiez loadStats() :

  loadStats() {
    this.userService.getStats().subscribe((res: any) => {
      this.adminCount = res.admin;
      this.userCount = res.user;

      this.pieChartData = {
        labels: ['Admins', 'Utilisateurs'],
        datasets: [{
          data: [this.adminCount, this.userCount],
          backgroundColor: ['#4f46e5', '#10b981'], // Indigo-600 et Emerald-500
          hoverBackgroundColor: ['#4338ca', '#059669'],
          borderWidth: 0, // Supprime les bordures blanches pour un look plus plat/moderne
          hoverOffset: 20
        }]
      };
    });
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