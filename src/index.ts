import {ActivatedRoute, Router} from '@angular/router';

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
export * from './core';
export * from './edit';

export {ApprService, BaseDiffApprComponent, DiffApprComponent, DiffApprService, DiffModel, DiffService} from './diff';
export * from './components';
export * from './formatter';
