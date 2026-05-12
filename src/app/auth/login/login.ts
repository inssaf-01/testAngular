import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html'
})
export class LoginComponent {

  loginValue = '';
  password = '';

  toasts: any[] = [];

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  triggerToast(message: string, type: 'success' | 'error') {
    const toast = {
      id: Date.now(),
      message,
      type
    };

    this.toasts.push(toast);

    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== toast.id);
    }, 3000);
  }

  login() {

    this.auth.login({
      login: this.loginValue,
      password: this.password
    }).subscribe({

      next: (res) => {

        if (!res.success) {
          this.triggerToast(res.message, 'error');
          return;
        }

        this.auth.saveToken(res.token);

        this.triggerToast('Login successful', 'success');

        setTimeout(() => {
          this.router.navigate(['/users']);
        }, 800);
      },

      error: () => {
        this.triggerToast('Server error', 'error');
      }

    });
  }
}