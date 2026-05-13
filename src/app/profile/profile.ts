import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../users/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html'
})
export class ProfileComponent implements OnInit {

  user: any = null;

  defaultImage = '/def_user.png';
  backendUrl = 'http://localhost:3000';

  selectedFile!: File;
  profileImage: string = '';

  constructor(
    private auth: AuthService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.user = this.auth.getUser();

    if (!this.user) return;

    this.profileImage =
      `${this.backendUrl}/users/profile-image/${this.user.id}?t=${Date.now()}`;
  }

  getImage() {
    return this.profileImage || this.defaultImage;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    this.selectedFile = file;

    const formData = new FormData();

    // IMPORTANT
    formData.append('file', file);

    formData.append('user_id', this.user.id);

    this.userService.uploadProfileImage(formData)
      .subscribe({
        next: () => {
          this.profileImage =
            `${this.backendUrl}/users/profile-image/${this.user.id}?t=${Date.now()}`;

          this.loadProfile();
        },
        error: (err) => {
          console.error('Upload error:', err);
        }
      });
  }
}