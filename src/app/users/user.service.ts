import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private api = 'http://localhost:3000/users';

  constructor(private http: HttpClient) { }

  getUsers() {
    return this.http.get(this.api);
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
  addUser(user: any) {
    return this.http.post(this.api, user);
  }
  updateUser(id: number, data: any) {
    return this.http.put(`${this.api}/${id}`, data);
  }
  getStats() {
    return this.http.get(`${this.api}/stats`);
  }
}