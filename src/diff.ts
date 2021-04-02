import {OnInit, ViewContainerRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {clone, diff} from 'reflectx';
import {buildId, initElement} from './angular';
import {error, LoadingService, ResourceService, StringMap} from './core';
import {getErrorFunc, getLoadingFunc, getMsgFunc, getResource} from './input';

export interface DiffParameter {
  resource: ResourceService;
  showMessage: (msg: string, option?: string) => void;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  loading?: LoadingService;
}
export interface DiffModel<T, ID> {
  id?: ID;
  origin?: T;
  value: T;
}
export interface DiffService<T, ID> {
  keys(): string[];
  diff(id: ID, ctx?: any): Promise<DiffModel<T, ID>>;
}

export enum Status {
  NotFound = 0,
  Success = 1,
  VersionError = 2,
  Error = 4
}
export interface ApprService<ID> {
  approve(id: ID, ctx?: any): Promise<Status>;
  reject(id: ID, ctx?: any): Promise<Status>;
}
export interface DiffApprService<T, ID> extends DiffService<T, ID>, ApprService<ID> {
}
export class BaseDiffApprComponent<T, ID> {
  constructor(protected service: DiffApprService<T, ID>,
      param: ResourceService|DiffParameter,
      showMessage?: (msg: string, option?: string) => void,
      showError?: (m: string, title?: string, detail?: string, callback?: () => void) => void,
      loading?: LoadingService) {
    this.resourceService = getResource(param);
    this.resource = this.resourceService.resource();
    this.loading = getLoadingFunc(param, loading);
    this.showError = getErrorFunc(param, showError);
    this.showMessage = getMsgFunc(param, showMessage);
    this.back = this.back.bind(this);
    const x: any = {};
    this.origin = x;
    this.value = x;
    this.approve = this.approve.bind(this);
    this.reject = this.reject.bind(this);
    this.handleError = this.handleError.bind(this);
    this.end = this.end.bind(this);
    this.formatFields = this.formatFields.bind(this);
    this.load = this.load.bind(this);
    this.handleNotFound = this.handleNotFound.bind(this);
  }
  protected showMessage: (msg: string, option?: string) => void;
  protected showError: (m: string, title?: string, detail?: string, callback?: () => void) => void;
  protected resourceService: ResourceService;
  protected loading?: LoadingService;
  resource: StringMap;
  protected running: boolean;
  protected form: HTMLFormElement;
  protected id: ID;
  origin: T;
  value: T;
  disabled: boolean;

  protected back(): void {
    window.history.back();
  }

  async load(_id: ID) {
    const x: any = _id;
    if (x && x !== '') {
      this.id = _id;
      try {
        this.running = true;
        if (this.loading) {
          this.loading.showLoading();
        }
        const ctx: any = {};
        const dobj = await this.service.diff(_id, ctx);
        if (!dobj) {
          this.handleNotFound(this.form);
        } else {
          const formatdDiff = formatDiffModel(dobj, this.formatFields);
          this.value = formatdDiff.value;
          this.origin = formatdDiff.origin;
          showDiff(this.form, formatdDiff.value, formatdDiff.origin);
        }
      } catch (err) {
        const data = (err &&  err.response) ? err.response : err;
        if (data && data.status === 404) {
          this.handleNotFound(this.form);
        } else {
          error(err, this.resourceService.value, this.showError);
        }
      } finally {
        this.running = false;
        if (this.loading) {
          this.loading.hideLoading();
        }
      }
    }
  }
  protected handleNotFound(form?: HTMLFormElement) {
    this.disabled = true;
    const r = this.resourceService;
    this.showError(r.value('error_not_found'), r.value('error'));
  }

  formatFields(value: T): T {
    return value;
  }
  async approve(event: Event) {
    event.preventDefault();
    if (this.running) {
      return;
    }
    const r = this.resourceService;
    try {
      this.running = true;
      if (this.loading) {
        this.loading.showLoading();
      }
      const ctx: any = {};
      const status = await this.service.approve(this.id, ctx);
      if (status === Status.Success) {
        this.showMessage(r.value('msg_approve_success'));
      } else if (status === Status.VersionError) {
        this.showMessage(r.value('msg_approve_version_error'));
      } else if (status === Status.NotFound) {
        this.handleNotFound(this.form);
      } else {
        this.showError(r.value('error_internal'), r.value('error'));
      }
    } catch (err) {
      this.handleError(err);
    } finally {
      this.end();
    }
  }
  async reject(event: Event) {
    event.preventDefault();
    if (this.running) {
      return;
    }
    const r = this.resourceService;
    try {
      this.running = true;
      if (this.loading) {
        this.loading.showLoading();
      }
      const ctx: any = {};
      const status = await this.service.reject(this.id, ctx);
      if (status === Status.Success) {
        this.showMessage(r.value('msg_reject_success'));
      } else if (status === Status.VersionError) {
        this.showMessage(r.value('msg_approve_version_error'));
      } else if (status === Status.NotFound) {
        this.handleNotFound(this.form);
      } else {
        this.showError(r.value('error_internal'), r.value('error'));
      }
    } catch (err) {
      this.handleError(err);
    } finally {
      this.end();
    }
  }
  protected handleError(err: any): void {
    const r = this.resourceService;
    const data = (err &&  err.response) ? err.response : err;
    if (data && (data.status === 404 || data.status === 409)) {
      if (data.status === 404) {
        this.handleNotFound();
      } else {
        this.showMessage(r.value('msg_approve_version_error'));
      }
    } else {
      error(err, r.value, this.showError);
    }
  }
  protected end() {
    this.disabled = true;
    this.running = false;
    if (this.loading) {
      this.loading.hideLoading();
    }
  }
}
export class DiffApprComponent<T, ID> extends BaseDiffApprComponent<T, ID> implements OnInit {
  constructor(protected viewContainerRef: ViewContainerRef, protected route: ActivatedRoute,
    service: DiffApprService<T, ID>,
    param: ResourceService|DiffParameter,
    showMessage?: (msg: string, option?: string) => void,
    showError?: (m: string, title?: string, detail?: string, callback?: () => void) => void,
    loading?: LoadingService) {
    super(service, param, showMessage, showError, loading);
    this.ngOnInit = this.ngOnInit.bind(this);
  }
  ngOnInit() {
    this.form = initElement(this.viewContainerRef);
    const id: ID = buildId<ID>(this.route, this.service.keys());
    this.load(id);
  }
}
export function showDiff<T>(form: HTMLFormElement, value: T, origin?: T): void {
  if (!origin) {
    origin = ({} as any);
  }
  const differentKeys = diff(origin, value);
  for (const differentKey of differentKeys) {
    const y = form.querySelector('.' + differentKey);
    if (y) {
      if (y.childNodes.length === 3) {
        y.children[1].classList.add('highlight');
        y.children[2].classList.add('highlight');
      } else {
        y.classList.add('highlight');
      }
    }
  }
}
export function formatDiffModel<T, ID>(obj: DiffModel<T, ID>, formatFields?: (obj3: T) => T): DiffModel<T, ID> {
  if (!obj) {
    return obj;
  }
  const obj2 = clone(obj);
  if (!obj2.origin) {
    obj2.origin = {};
  } else {
    if (typeof obj2.origin === 'string') {
      obj2.origin = JSON.parse(obj2.origin);
    }
    if (formatFields && typeof obj2.origin === 'object' && !Array.isArray(obj2.origin)) {
      obj2.origin = formatFields(obj2.origin);
    }
  }
  if (!obj2.value) {
    obj2.value = {};
  } else {
    if (typeof obj2.value === 'string') {
      obj2.value = JSON.parse(obj2.value);
    }
    if (formatFields && typeof obj2.value === 'object' && !Array.isArray(obj2.value)) {
      obj2.value = formatFields(obj2.value);
    }
  }
  return obj2;
}
