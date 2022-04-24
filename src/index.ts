import {ActivatedRoute, Router} from '@angular/router';

export interface DataMap<V> {
  [key: string]: V;
}
export function isAuthorized<T, V>(ur: T, router?: Router, to?: string, url?: string, m?: DataMap<V>, home?: string) {
  if (!ur) {
    if (to && to.length > 0 && router) {
      router.navigate([to]);
    }
    return false;
  } else {
    if (!m) {
      return true;
    } else {
      if (!url) {
        return true;
      }
      const p = m[url];
      if (p) {
        return true;
      } else {
        if (router && home && home.length > 0) {
          router.navigate([home]);
        }
        return false;
      }
    }
  }
}

export function getUrlParam(route: ActivatedRoute): any {
  if (!route) {
    return null;
  }
  const param: any = route.params;
  const obj = param._value;
  return obj;
}

export function navigate(router: Router, stateTo: any, params?: any): void {
  const commands: any = [];
  commands.push(stateTo);
  if (params) {
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

export * from './angular';
export * from './formutil';
export * from './core';
export * from './edit';

export * from './diff';
export * from './components';
export * from './formatter';
export * from './search';
export * from './reflect';
