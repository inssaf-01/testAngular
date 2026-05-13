import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ImageService {

    private backendUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) { }

    uploadProfileImage(file: File, userId: number) {

        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', userId.toString());

        return this.http.post(
            `${this.backendUrl}/users/upload-profile-image`,
            formData
        );
    }

    getProfileImage(userId: number) {
        return `${this.backendUrl}/users/profile-image/${userId}`;
    }

    getProfileImageWithCacheBuster(userId: number) {
        return `${this.getProfileImage(userId)}?t=${Date.now()}`;
    }
}