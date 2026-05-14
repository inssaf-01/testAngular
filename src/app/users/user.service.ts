import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private api = 'http://localhost:3000/users';

  constructor(private http: HttpClient) { }

  // avant pagination 
  // getUsers() { 
  //   return this.http.get(this.api);
  // }

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
  uploadProfileImage(data: FormData) {
    return this.http.post(
      `${this.api}/upload-profile-image`,
      data
    );
  }
  // apres pagination 
  getUsers(page: number, limit: number) {
    return this.http.get<any>(
      `${this.api}?page=${page}&limit=${limit}`
    );
  }
  updateUserStatus(id: number, status: number) {
    return this.http.patch(`${this.api}/${id}/status`, { status });
  }
  getRoles() {
    return this.http.get(`${this.api}/roles`);
  }
}