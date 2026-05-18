import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = 'http://localhost:3000/auth';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  login(data: { login: string; password: string }) {
    return this.http.post<any>(`${this.api}/login`, data);
  }
  isBrowser(): boolean {
    return typeof window !== 'undefined';
  }
  saveToken(token: string) {
    localStorage.setItem('token', token);
  }
  isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch (e) {
      return true;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      this.logout();
      return false;
    }
  }
  saveUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login'], { replaceUrl: true });
  }
  //RESET PWD
  sendResetCode(data: { login: string }) {
    return this.http.post<any>(`${this.api}/send-reset-code`, data);
  }

  verifyResetCode(data: { login: string; code: string }) {
    return this.http.post<any>(`${this.api}/verify-reset-code`, data);
  }

  resetPassword(data: {
    login: string;
    code: string;
    newPassword: string;
  }) {
    return this.http.post<any>(`${this.api}/reset-password`, data);
  }
  getMe() {
    return this.http.get<any>(`${this.api}/me`);
  }



}