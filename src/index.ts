import {HttpParams} from '@angular/common/http';
import {ViewContainerRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

export function getUrlParam(route: ActivatedRoute): any {
  if (!route) {
    return null;
  }
  const param: any = route.params;
  const obj = param._value;
  return obj;
}

export function navigate(router: Router, stateTo: any, params = null): void {
  const commands: any = [];
  commands.push(stateTo);
  if (params != null) {
    if (typeof params === 'object') {
      for (const param of params) {
        commands.push(param);
      }
    }
    router.navigate(commands);
  } else {
    router.navigate([stateTo]);
  }
}

export function getId<ID>(id: ID, keys: string[], route: ActivatedRoute): ID {
  if (id) {
    return id;
  } else {
    return buildId(keys, route);
  }
}
export function buildId<ID>(keys: string[], route: ActivatedRoute): ID {
  if (!route || !keys || keys.length === 0) {
    return null;
  }
  const param: any = route.params;
  const obj = param._value;
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

export function buildFromUrl() {
  return buildParameters(window.location.search);
}
export function buildParameters(url: string): any {
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
export function initElement(viewContainerRef?: ViewContainerRef|any, initForm?: (form: any, initMat?: (f: any) => void) => void, initMat?: (f: any) => void): any {
  if (!viewContainerRef) {
    return null;
  }
  let nativeElement = viewContainerRef;
  if (viewContainerRef.element && viewContainerRef.element.nativeElement) {
    nativeElement = viewContainerRef.element.nativeElement;
  }
  if (nativeElement.querySelector) {
    const form = nativeElement.querySelector('form');
    if (form && initForm) {
      initForm(form, initMat);
    }
    return form;
  }
}
