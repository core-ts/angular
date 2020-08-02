import {HttpParams} from '@angular/common/http';
import {ViewContainerRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {storage} from './storage';

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

export function focusFirstElement(form: any): void {
  let i = 0;
  const len = form.length;
  for (i = 0; i < len; i++) {
    const ctrl = form[i];
    if (!(ctrl.readOnly || ctrl.disabled)) {
      let nodeName = ctrl.nodeName;
      const type = ctrl.getAttribute('type');
      if (nodeName === 'INPUT' && type !== null) {
        nodeName = type.toUpperCase();
      }
      if (nodeName !== 'BUTTON'
        && nodeName !== 'RESET'
        && nodeName !== 'SUBMIT'
        && nodeName !== 'CHECKBOX'
        && nodeName !== 'RADIO') {
        ctrl.focus();
        ctrl.scrollIntoView();
        try {
          ctrl.setSelectionRange(0, ctrl.value.length);
        } catch (error) {
        }
        return;
      }
    }
  }
}
export function initForm(viewContainerRef?: ViewContainerRef|any, initMat?: (f: any) => void): any {
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
      if (!form.getAttribute('date-format')) {
        const df = storage.getDateFormat();
        form.setAttribute('date-format', df);
      }
      setTimeout(() => {
        if (initMat) {
          initMat(form);
        }
        focusFirstElement(form);
      }, 100);
    }
    return form;
  }
}
export function initMaterial(form: any): void {
  storage.ui().initMaterial(form);
}
export function showToast(msg: string): void {
  storage.toast().showToast(msg);
}
export function alertError(msg: string, header?: string, detail?: string, callback?: () => void): void {
  storage.alert().alertError(msg, header, detail, callback);
}
