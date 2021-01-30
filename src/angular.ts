import {HttpParams} from '@angular/common/http';
import {ViewContainerRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {focusFirstElement} from './formutil';

export function getId<ID>(id: ID, keys: string[], route: ActivatedRoute): ID {
  if (id) {
    return id;
  } else {
    return buildId(route, keys);
  }
}
export function buildId<ID>(route: ActivatedRoute, keys?: string[]): ID {
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
export function initElement(viewContainerRef?: ViewContainerRef|any, initMat?: (f: HTMLFormElement) => void): HTMLFormElement {
  if (!viewContainerRef) {
    return null;
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

export function buildFromUrl<T>(): T {
  return buildParameters<T>(window.location.search);
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
