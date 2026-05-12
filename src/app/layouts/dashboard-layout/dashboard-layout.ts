import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './dashboard-layout.html'
})
export class DashboardLayoutComponent {
  user: any = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) { this.user = this.auth.getUser();}

  logout() {
    this.auth.logout(); // supprime token
    this.router.navigate(['/login']); // retour login
  }
}