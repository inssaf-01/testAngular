import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = 'http://localhost:3000/auth';

  constructor(
    private http: HttpClient,
    private router: Router   // ✅ AJOUT ICI
  ) { }

  login(data: { login: string; password: string }) {
    console.log('login function ');
    return this.http.post<any>(`${this.api}/login`, data);
  }
  isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  saveToken(token: string) {
    if (this.isBrowser()) {
      localStorage.setItem('token', token);
    }
  }

  getToken() {
    if (this.isBrowser()) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser()) return false;
    return !!localStorage.getItem('token');
  }
  saveUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  logout() {
    if (this.isBrowser()) {
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}