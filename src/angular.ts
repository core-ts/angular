import {HttpClient, HttpParams} from '@angular/common/http';
import {ViewContainerRef} from '@angular/core';
import {Headers} from './core';
import {focusFirstElement} from './formutil';

export interface ActivatedRoute {
  /** An observable of the matrix parameters scoped to this route. */
  params: any;
}
export function getId<ID>(route: ActivatedRoute, keys?: string[], id?: ID): ID|null {
  if (id) {
    return id;
  } else {
    return buildId(route, keys);
  }
}
export function buildId<ID>(route: ActivatedRoute, keys?: string[]): ID|null {
  if (!route) {
    return null;
  }
  const param: any = route.params;
  const obj = param._value;
  if (!keys || keys.length === 0) {
    return obj['id'];
  }
  if (!(keys && keys.length > 0)) {
    return null;
  }
  if (keys.length === 1) {
    const x = obj[keys[0]];
    if (x && x !== '') {
      return x;
    }
    return obj['id'];
  }
  const id: any = {};
  for (const key of keys) {
    const v = obj[key];
    if (!v) {
      return null;
    }
    id[key] = v;
  }
  return id;
}
export function initElement(viewContainerRef?: ViewContainerRef|any, initMat?: (f: HTMLFormElement) => void): HTMLFormElement|undefined {
  if (!viewContainerRef) {
    return undefined;
  }
  let nativeElement = viewContainerRef;
  if (viewContainerRef.element && viewContainerRef.element.nativeElement) {
    nativeElement = viewContainerRef.element.nativeElement;
  }
  if (nativeElement.querySelector) {
    const form = nativeElement.querySelector('form');
    if (form) {
      initForm(form, initMat);
    }
    return form;
  }
  return undefined;
}
export function initForm(form: HTMLFormElement, initMat?: (f: HTMLFormElement) => void): HTMLFormElement {
  if (form) {
    setTimeout(() => {
      if (initMat) {
        initMat(form);
      }
      focusFirstElement(form);
    }, 100);
  }
  return form;
}

export function buildFromUrl<S>(): S {
  return buildParameters<S>(window.location.search);
}
export function buildParameters<T>(url: string): T {
  let urlSearch = url;
  const i = urlSearch.indexOf('?');
  if (i >= 0) {
    urlSearch = url.substr(i + 1);
  }
  const obj: any = {};
  const httpParams = new HttpParams({fromString: urlSearch});
  for (const key of httpParams.keys()) {
    obj[key] = httpParams.get(key);
  }
  return obj;
}

export class HttpRequest {
  constructor(protected http: HttpClient, protected getOptions?: () => { headers?: Headers }) {
    this.get = this.get.bind(this);
    this.delete = this.delete.bind(this);
    this.post = this.post.bind(this);
    this.put = this.put.bind(this);
    this.patch = this.patch.bind(this);
  }
  get<T>(url: string, opts?: { headers?: Headers; }): Promise<T> {
    const x = (this.getOptions ? this.getOptions() : undefined);
    return this.http.get<T>(url, opts ? opts : x).toPromise();
  }
  delete<T>(url: string, opts?: { headers?: Headers; }): Promise<T> {
    const x = (this.getOptions ? this.getOptions() : undefined);
    return this.http.delete<T>(url, opts ? opts : x).toPromise();
  }
  post<T>(url: string, obj: any, opts?: { headers?: Headers; }): Promise<T> {
    const x = (this.getOptions ? this.getOptions() : undefined);
    return this.http.post<T>(url, obj, opts ? opts : x).toPromise();
  }
  put<T>(url: string, obj: any, opts?: { headers?: Headers; }): Promise<T> {
    const x = (this.getOptions ? this.getOptions() : undefined);
    return this.http.put<T>(url, obj, opts ? opts : x).toPromise();
  }
  patch<T>(url: string, obj: any, opts?: { headers?: Headers; }): Promise<T> {
    const x = (this.getOptions ? this.getOptions() : undefined);
    return this.http.patch<T>(url, obj, opts ? opts : x).toPromise();
  }
}
