import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {httpOptionsService} from './http/HttpOptionsService';
import {storage} from './storage';

interface Headers {
  [key: string]: any;
}

@Injectable()
export class DefaultHttpRequest {
  constructor(protected http: HttpClient) {
  }
  get<T>(url: string, options?: { headers?: Headers; }): Promise<T> {
    return this.http.get<T>(url, options ? options : httpOptionsService .getHttpOptions()).toPromise();
  }
  delete<T>(url: string, options?: { headers?: Headers; }): Promise<T> {
    return this.http.delete<T>(url, options ? options : httpOptionsService .getHttpOptions()).toPromise();
  }
  post<T>(url: string, obj: any, options?: { headers?: Headers; }): Promise<T> {
    return this.http.post<T>(url, obj, options ? options : httpOptionsService .getHttpOptions()).toPromise();
  }
  put<T>(url: string, obj: any, options?: { headers?: Headers; }): Promise<T> {
    return this.http.put<T>(url, obj, options ? options : httpOptionsService .getHttpOptions()).toPromise();
  }
  patch<T>(url: string, obj: any, options?: { headers?: Headers; }): Promise<T> {
    return this.http.patch<T>(url, obj, options ? options : httpOptionsService .getHttpOptions()).toPromise();
  }
}

@Injectable()
export class AuthenticationService implements CanActivate {
  constructor(public router: Router) {
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = storage.getUser();
    if (user) {
      return true;
    } else {
      this.router.navigate([storage.authentication]);
      return false;
    }
  }
}

@Injectable()
export class AuthorizationService implements CanActivate {
  constructor(public router: Router) {
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = storage.getUser();
    if (!user) {
      this.router.navigate([storage.authentication]);
      return false;
    } else {
      const privileges = storage.privileges();
      const p = privileges.get(state.url);
      if (p) {
        return true;
      } else {
        this.router.navigate([storage.home]);
        return false;
      }
    }
  }
}
