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
  //RESET PWD
  showResetModal = false;
  resetStep = 1;

  resetLogin = '';
  resetCode = '';
  newPassword = '';
  confirmPassword = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }
  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/users'], { replaceUrl: true });
    }
  }

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

        this.auth.saveToken(res.token);
        this.auth.saveUser(res.user);

        this.triggerToast(res.message || 'Login successful', 'success');

        setTimeout(() => {
          this.router.navigate(['/users']);
        }, 800);
      },

      error: (err) => {

        // Cas backend avec réponse JSON
        if (err?.error?.message) {
          this.triggerToast(err.error.message, 'error');
          return;
        }

        // Cas serveur injoignable
        if (err.status === 0) {
          this.triggerToast('Server is not reachable', 'error');
          return;
        }

        // Cas serveur erreur 500
        if (err.status >= 500) {
          this.triggerToast('Internal server error', 'error');
          return;
        }

        // fallback
        this.triggerToast('Unexpected error', 'error');
      }

    });
  }
  openResetModal() {
    this.showResetModal = true;
    this.resetStep = 1;
  }

  closeResetModal() {
    this.showResetModal = false;
  }

  sendResetCode() {
    this.auth.sendResetCode({
      login: this.resetLogin
    }).subscribe({
      next: (res) => {
        this.triggerToast(res.message, 'success');
        this.resetStep = 2;
      },
      error: (err) => {
        this.triggerToast(err?.error?.message || 'Error', 'error');
      }
    });
  }

  verifyResetCode() {
    this.auth.verifyResetCode({
      login: this.resetLogin,
      code: this.resetCode
    }).subscribe({
      next: (res) => {
        this.triggerToast(res.message, 'success');
        this.resetStep = 3;
      },
      error: (err) => {
        this.triggerToast(err?.error?.message || 'Invalid code', 'error');
      }
    });
  }

  resetPasswordAction() {
    if (this.newPassword !== this.confirmPassword) {
      this.triggerToast('Passwords do not match', 'error');
      return;
    }

    this.auth.resetPassword({
      login: this.resetLogin,
      code: this.resetCode,
      newPassword: this.newPassword
    }).subscribe({
      next: (res) => {
        this.triggerToast(res.message, 'success');
        this.closeResetModal();
      },
      error: (err) => {
        this.triggerToast(err?.error?.message || 'Reset failed', 'error');
      }
    });
  }


}