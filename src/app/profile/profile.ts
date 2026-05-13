import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../users/user.service';
import { ImageService } from './image.service';

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
    private imageService: ImageService
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

    const userId = this.user.id;

    this.imageService.uploadProfileImage(file, userId)
      .subscribe(() => {
        this.profileImage =
          this.imageService.getProfileImage(userId) + '?t=' + Date.now();

        this.loadProfile();
      });
  }
}