import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    constructor(
        private auth: AuthService,
        private router: Router
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler) {

        const token = this.auth.getToken();

        console.log('JWT TOKEN IN INTERCEPTOR:', token);

        let cloned = req;

        if (token) {
            cloned = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        return next.handle(cloned);
    }
}