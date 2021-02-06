import {OnInit, ViewContainerRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {clone, equalAll, makeDiff, setAll, setValue, trim} from 'reflectx';
import {addParametersIntoUrl, append, buildSearchMessage, changePage, changePageSize, formatResults, getDisplayFields, handleSortEvent, initSearchable, mergeSearchModel, more, optimizeSearchModel, reset, showResults} from 'search-utilities';
import {buildFromUrl, buildId, initElement} from './angular';
import {error, getModelName, LoadingService, Locale, message, Metadata, MetaModel, ResourceService, StringMap, UIService} from './core';
import {build, buildMessageFromStatusCode, createModel, handleVersion, ResultInfo, Status} from './edit';
import {format, json} from './formatter';
import {focusFirstError, readOnly} from './formutil';
import {getConfirmFunc, getErrorFunc, getLoadingFunc, getLocaleFunc, getMsgFunc, getResource, getUIService} from './input';

export const enLocale = {
  'id': 'en-US',
  'countryCode': 'US',
  'dateFormat': 'M/d/yyyy',
  'firstDayOfWeek': 1,
  'decimalSeparator': '.',
  'groupSeparator': ',',
  'decimalDigits': 2,
  'currencyCode': 'USD',
  'currencySymbol': '$',
  'currencyPattern': 0
};
export class RootComponent {
  constructor(protected resourceService: ResourceService, protected getLocale?: (profile?: string) => Locale) {
    if (resourceService) {
      this.resource = resourceService.resource();
    }
    this.currencySymbol = this.currencySymbol.bind(this);
    this.getCurrencyCode = this.getCurrencyCode.bind(this);
    this.back = this.back.bind(this);
  }
  protected includeCurrencySymbol: boolean;
  protected resource: StringMap;
  protected running: boolean;
  protected form?: HTMLFormElement;

  protected back(): void {
    window.history.back();
  }

  protected currencySymbol(): boolean {
    return this.includeCurrencySymbol;
  }

  protected getCurrencyCode(): string {
    return (this.form ? this.form.getAttribute('currency-code') : null);
  }
}
export interface ViewParameter {
  resource: ResourceService;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  getLocale?: (profile?: string) => Locale;
  loading?: LoadingService;
}
export interface ViewService<T, ID> {
  metadata?(): Metadata;
  keys?(): string[];
  load(id: ID, ctx?: any): Promise<T>;
}
export class BaseViewComponent<T, ID> extends RootComponent {
  constructor(sv: ((id: ID, ctx?: any) => Promise<T>)|ViewService<T, ID>,
      param: ResourceService|ViewParameter,
      showError?: (msg: string, title?: string, detail?: string, callback?: () => void) => void,
      getLocale?: (profile?: string) => Locale,
      loading?: LoadingService) {
    super(getResource(param), getLocaleFunc(param, getLocale));
    this.showError = getErrorFunc(param, showError);
    this.loading = getLoadingFunc(param, loading);
    if (sv) {
      if (typeof sv === 'function') {
        this.loadFn = sv;
      } else {
        this.service = sv;
        if (this.service.metadata) {
          const m = this.service.metadata();
          if (m) {
            this.metadata = m;
            const meta = build(m);
            this.keys = meta.keys;
          }
        }
      }
    }
    this.getModelName = this.getModelName.bind(this);
    const n = this.getModelName();
    this[n] = {} as any;
    this.load = this.load.bind(this);
    this.showModel = this.showModel.bind(this);
    this.getModel = this.getModel.bind(this);
    this.handleNotFound = this.handleNotFound.bind(this);
  }
  protected loading?: LoadingService;
  protected showError: (msg: string, title?: string, detail?: string, callback?: () => void) => void;
  protected loadFn: (id: ID, ctx?: any) => Promise<T>;
  protected service: ViewService<T, ID>;
  protected keys: string[];
  protected metadata?: Metadata;

  async load(_id: ID, callback?: (m: T, showF: (model: T) => void) => void) {
    const id: any = _id;
    if (id && id !== '') {
      try {
        this.running = true;
        if (this.loading) {
          this.loading.showLoading();
        }
        const ctx: any = {};
        let obj: T;
        if (this.loadFn) {
          obj = await this.loadFn(id, ctx);
        } else {
          obj = await this.service.load(id, ctx);
        }
        if (obj) {
          if (callback) {
            callback(obj, this.showModel);
          } else {
            this.showModel(obj);
          }
        } else {
          this.handleNotFound(this.form);
        }
      } catch (err) {
        const data = (err &&  err.response) ? err.response : err;
        if (data && data.status === 404) {
          this.handleNotFound(this.form);
        } else {
          error(err, this.resourceService, this.showError);
        }
      } finally {
        this.running = false;
        if (this.loading) {
          this.loading.hideLoading();
        }
      }
    }
  }
  protected handleNotFound(form?: HTMLFormElement): void {
    if (form) {
      readOnly(form);
    }
    const msg = message(this.resourceService, 'error_not_found', 'error');
    this.showError(msg.message, msg.title);
  }
  protected getModelName(): string {
    if (this.metadata) {
      return this.metadata.name;
    }
    const n = getModelName(this.form);
    if (!n || n.length === 0) {
      return 'model';
    }
  }
  protected showModel(model: T): void {
    const name = this.getModelName();
    this[name] = model;
  }
  getModel(): T {
    const name = this.getModelName();
    const model = this[name];
    return model;
  }
}
export class ViewComponent<T, ID> extends BaseViewComponent<T, ID> implements OnInit {
  constructor(protected viewContainerRef: ViewContainerRef, protected route: ActivatedRoute,
      sv: ((id: ID, ctx?: any) => Promise<T>)|ViewService<T, ID>,
      param: ResourceService|ViewParameter,
      showError?: (msg: string, title?: string, detail?: string, callback?: () => void) => void,
      getLocale?: (profile?: string) => Locale,
      loading?: LoadingService) {
    super(sv, param, showError, getLocale, loading);
    this.ngOnInit = this.ngOnInit.bind(this);
  }
  ngOnInit() {
    this.form = initElement(this.viewContainerRef);
    const id: ID = buildId<ID>(this.route, this.keys);
    this.load(id);
  }
}
interface BaseUIService {
  getValue(el: HTMLInputElement, locale?: Locale, currencyCode?: string): string|number|boolean;
  removeError(el: HTMLInputElement): void;
}
export class BaseComponent extends RootComponent {
  constructor(resourceService: ResourceService,
      getLocale?: (profile?: string) => Locale,
      ui?: BaseUIService,
      protected loading?: LoadingService) {
    super(resourceService, getLocale);
    this.uiS1 = ui;

    this.getModelName = this.getModelName.bind(this);
    this.includes = this.includes.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateStateFlat = this.updateStateFlat.bind(this);
  }
  private uiS1?: BaseUIService;
  /*
  protected init() {
    try {
      this.loadData();
    } catch (err) {
      this.handleError(err);
    }
  }

  refresh() {
    try {
      this.loadData();
    } catch (err) {
      this.handleError(err);
    }
  }
  */
  protected getModelName(): string {
    const n = getModelName(this.form);
    if (!n || n.length === 0) {
      return 'model';
    }
    // return 'state';
  }
  protected includes(checkedList: Array<string|number>, v: string|number): boolean {
    return v && checkedList &&  Array.isArray(checkedList) ? checkedList.includes(v) : false;
  }
  protected updateState(event: Event) {
    let locale: Locale = enLocale;
    if (this.getLocale) {
      locale = this.getLocale();
    }
    this.updateStateFlat(event, locale);
  }
  protected updateStateFlat(e: Event, locale?: Locale) {
    if (!locale) {
      locale = enLocale;
    }
    const ctrl = e.currentTarget as HTMLInputElement;
    let modelName = this.getModelName();
    if (!modelName) {
      modelName = ctrl.form.getAttribute('model-name');
    }
    const type = ctrl.getAttribute('type');
    const isPreventDefault = type && (['checkbox', 'radio'].indexOf(type.toLowerCase()) >= 0 ? false : true);
    if (isPreventDefault) {
      e.preventDefault();
    }
    if (this.uiS1 && ctrl.nodeName === 'SELECT' && ctrl.value && ctrl.classList.contains('invalid')) {
      this.uiS1.removeError(ctrl);
    }
    const ex = this[modelName];
    const dataField = ctrl.getAttribute('data-field');
    const field = (dataField ? dataField : ctrl.name);
    if (type && type.toLowerCase() === 'checkbox') {
      const v = valueOfCheckbox(ctrl);
      setValue(ex, field, v);
    } else {
      let v = ctrl.value;
      if (this.uiS1) {
        v = this.uiS1.getValue(ctrl, locale) as string;
      }
      // tslint:disable-next-line:triple-equals
      if (ctrl.value != v) {
        setValue(ex, field, v);
      }
    }
  }
}
export function valueOfCheckbox(ctrl: HTMLInputElement): string|number|boolean {
  const ctrlOnValue = ctrl.getAttribute('data-on-value');
  const ctrlOffValue = ctrl.getAttribute('data-off-value');
  if (ctrlOnValue && ctrlOffValue) {
    const onValue = ctrlOnValue ? ctrlOnValue : true;
    const offValue = ctrlOffValue ? ctrlOffValue : false;
    return ctrl.checked === true ? onValue : offValue;
  } else {
    return ctrl.checked === true;
  }
}
export class MessageComponent extends BaseComponent {
  constructor(
    resourceService: ResourceService,
    getLocale?: (profile?: string) => Locale,
    ui?: UIService,
    protected loading?: LoadingService) {
    super(resourceService, getLocale, ui, loading);
    this.showMessage = this.showMessage.bind(this);
    this.showError = this.showError.bind(this);
    this.hideMessage = this.hideMessage.bind(this);
  }
  resource: StringMap;
  message = '';
  alertClass = '';

  showMessage(msg: string, field?: string): void {
    this.alertClass = 'alert alert-info';
    this.message = msg;
  }
  showError(msg: string, field?: string): void {
    this.alertClass = 'alert alert-danger';
    this.message = msg;
  }
  hideMessage(field?: string): void {
    this.alertClass = '';
    this.message = '';
  }
}

export interface EditParameter {
  resource: ResourceService;
  showMessage: (msg: string, option?: string) => void;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  confirm: (m2: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void;
  getLocale?: (profile?: string) => Locale;
  ui?: UIService;
  loading?: LoadingService;
}
export interface GenericService<T, ID, R> extends ViewService<T, ID> {
  patch?(obj: T, ctx?: any): Promise<R>;
  insert(obj: T, ctx?: any): Promise<R>;
  update(obj: T, ctx?: any): Promise<R>;
  delete?(id: ID, ctx?: any): Promise<number>;
}
export class BaseEditComponent<T, ID> extends BaseComponent {
  constructor(protected service: GenericService<T, ID, number|ResultInfo<T>>, param: ResourceService|EditParameter,
      showMessage?: (msg: string, option?: string) => void,
      showError?: (m: string, title?: string, detail?: string, callback?: () => void) => void,
      confirm?: (m2: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void,
      getLocale?: (profile?: string) => Locale,
      uis?: UIService,
      loading?: LoadingService,
      patchable?: boolean, backOnSaveSuccess?: boolean) {
    super(getResource(param), getLocaleFunc(param, getLocale), getUIService(param, uis), getLoadingFunc(param, loading));
    this.ui = getUIService(param, uis);
    this.showError = getErrorFunc(param, showError);
    this.showMessage = getMsgFunc(param, showMessage);
    this.confirm = getConfirmFunc(param, confirm);
    if (service.metadata) {
      const metadata = service.metadata();
      if (metadata) {
        const meta = build(metadata);
        this.keys = meta.keys;
        this.version = meta.version;
        this.metadata = metadata;
        this.metamodel = meta;
      }
    }
    if (!this.keys && service.keys) {
      const k = service.keys();
      if (k) {
        this.keys = k;
      }
    }
    if (!this.keys) {
      this.keys = [];
    }
    if (patchable === false) {
      this.patchable = patchable;
    }
    if (backOnSaveSuccess === false) {
      this.backOnSuccess = backOnSaveSuccess;
    }
    this.insertSuccessMsg = this.resourceService.value('msg_save_success');
    this.updateSuccessMsg = this.resourceService.value('msg_save_success');

    this.getModelName = this.getModelName.bind(this);
    const n = this.getModelName();
    this[n] = {} as any;
    this.load = this.load.bind(this);
    this.resetState = this.resetState.bind(this);
    this.handleNotFound = this.handleNotFound.bind(this);
    this.createModel = this.createModel.bind(this);
    this.formatModel = this.formatModel.bind(this);
    this.showModel = this.showModel.bind(this);
    this.getModel = this.getModel.bind(this);
    this.getRawModel = this.getRawModel.bind(this);

    this.newOnClick = this.newOnClick.bind(this);
    this.saveOnClick = this.saveOnClick.bind(this);
    this.onSave = this.onSave.bind(this);
    this.confirm = this.confirm.bind(this);
    this.validate = this.validate.bind(this);
    this.save = this.save.bind(this);
    this.succeed = this.succeed.bind(this);
    this.successMessage = this.successMessage.bind(this);
    this.save = this.save.bind(this);
    this.postSave = this.postSave.bind(this);
    this.handleDuplicateKey = this.handleDuplicateKey.bind(this);
  }
  protected showMessage: (msg: string, option?: string) => void;
  protected showError: (m: string, title?: string, detail?: string, callback?: () => void) => void;
  protected confirm: (m2: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void;
  protected ui?: UIService;
  protected metadata?: Metadata;
  protected metamodel?: MetaModel;
  protected keys: string[];
  protected version?: string;

  newMode: boolean;
  setBack: boolean;
  patchable = true;
  backOnSuccess = true;
  protected orginalModel: T;

  addable = true;
  editable = true;
  deletable: boolean;

  insertSuccessMsg: string;
  updateSuccessMsg: string;
  async load(_id: ID, callback?: (m: T, showM: (m2: T) => void) => void) {
    const id: any = _id;
    if (id && id !== '') {
      const com = this;
      try {
        const obj = await this.service.load(id);
        if (!obj) {
          com.handleNotFound(com.form);
        } else {
          this.newMode = false;
          this.orginalModel = clone(obj);
          this.formatModel(obj);
          if (callback) {
            callback(obj, this.showModel);
          } else {
            this.showModel(obj);
          }
        }
      } catch (err) {
        const data = (err &&  err.response) ? err.response : err;
        if (data && data.status === 404) {
          com.handleNotFound(com.form);
        } else {
          error(err, this.resourceService, this.showError);
        }
      } finally {
        com.running = false;
        if (this.loading) {
          this.loading.hideLoading();
        }
      }
    } else {
      this.newMode = true;
      this.orginalModel = null;
      const obj = this.createModel();
      if (callback) {
        callback(obj, this.showModel);
      } else {
        this.showModel(obj);
      }
    }
  }
  protected resetState(newMod: boolean, model: T, originalModel: T) {
    this.newMode = newMod;
    this.orginalModel = originalModel;
    this.formatModel(model);
    this.showModel(model);
  }
  protected handleNotFound(form?: HTMLFormElement): void {
    const msg = message(this.resourceService, 'error_not_found', 'error');
    if (this.form) {
      readOnly(form);
    }
    this.showError(msg.message, msg.title);
  }
  protected formatModel(obj: T): void {
    if (this.metamodel) {
      let locale: Locale = enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      format(obj, this.metamodel, locale, this.getCurrencyCode(), this.currencySymbol());
    }
  }
  protected getModelName(): string {
    if (this.metadata) {
      return this.metadata.name;
    }
    const n = getModelName(this.form);
    if (!n || n.length === 0) {
      return 'model';
    }
  }
  protected showModel(model: T): void {
    const n = this.getModelName();
    this[n] = model;
  }
  getRawModel(): T {
    const name = this.getModelName();
    const model = this[name];
    return model;
  }
  getModel(): T {
    const name = this.getModelName();
    const model = this[name];
    const obj = clone(model);
    if (this.metamodel) {
      let locale: Locale = enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      json(obj, this.metamodel, locale, this.getCurrencyCode());
    }
    return obj;
  }
  protected createModel(): T {
    const metadata = this.service.metadata();
    if (metadata) {
      const obj = createModel<T>(metadata);
      return obj;
    } else {
      const obj: any = {};
      return obj;
    }
  }

  newOnClick(event?: Event): void {
    if (!this.form && event && event.currentTarget) {
      const ctrl = event.currentTarget as HTMLInputElement;
      if (ctrl.form) {
        this.form = ctrl.form;
      }
    }
    this.resetState(true, this.createModel(), null);
    const u = this.ui;
    const f = this.form;
    if (u && f) {
      setTimeout(() => {
        u.removeFormError(f);
      }, 100);
    }
  }
  saveOnClick(event?: Event, isBack?: boolean): void {
    if (!this.form && event && event.currentTarget) {
      this.form = (event.currentTarget as HTMLInputElement).form;
    }
    if (isBack) {
      this.onSave(isBack);
    } else {
      this.onSave(this.backOnSuccess);
    }
  }

  onSave(isBack?: boolean) {
    const r = this.resourceService;
    if (this.newMode && this.addable !== true) {
      const msg = message(r, 'error_permission_add', 'error_permission');
      this.showError(msg.message, msg.title);
      return;
    } else if (!this.newMode && this.editable !== true) {
      const msg = message(r, 'error_permission_edit', 'error_permission');
      this.showError(msg.message, msg.title);
      return;
    } else {
      if (this.running) {
        return;
      }
      const com = this;
      const obj = com.getModel();
      if (!this.newMode) {
        const diffObj = makeDiff(this.orginalModel, obj, this.keys, this.version);
        const l = Object.keys(diffObj).length;
        if (l === 0) {
          this.showMessage(r.value('msg_no_change'));
        } else {
          com.validate(obj, () => {
            const msg = message(r, 'msg_confirm_save', 'confirm', 'yes', 'no');
            this.confirm(msg.message, msg.title, () => {
              com.save(obj, diffObj, isBack);
            }, msg.no, msg.yes);
          });
        }
      } else {
        com.validate(obj, () => {
          const msg = message(r, 'msg_confirm_save', 'confirm', 'yes', 'no');
          this.confirm(msg.message, msg.title, () => {
            com.save(obj, obj, isBack);
          }, msg.no, msg.yes);
        });
      }
    }
  }
  validate(obj: T, callback: (u?: T) => void): void {
    if (this.ui) {
      let locale: Locale = enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      const valid = this.ui.validateForm(this.form, locale);
      if (valid) {
        callback(obj);
      }
    } else {
      callback(obj);
    }
  }
  async save(obj: T, body?: T, isBack?: boolean) {
    this.running = true;
    if (this.loading) {
      this.loading.showLoading();
    }
    const isBackO = (isBack == null || isBack === undefined ? this.backOnSuccess : isBack);
    const com = this;
    try {
      const ctx: any = {};
      if (!this.newMode) {
        if (this.patchable === true && this.service.patch && body && Object.keys(body).length > 0) {
          const result = await this.service.patch(body, ctx);
          com.postSave(result, isBackO);
        } else {
          const result = await this.service.update(obj, ctx);
          com.postSave(result, isBackO);
        }
      } else {
        trim(obj);
        const result = await this.service.insert(obj, ctx);
        com.postSave(result, isBackO);
      }
    } catch (err) {
      error(err, this.resourceService, this.showError);
    }
  }
  protected succeed(msg: string, backOnSave: boolean, result?: ResultInfo<T>): void {
    if (result) {
      const model = result.value;
      this.newMode = false;
      if (model && this.setBack) {
        if (!this.backOnSuccess) {
          this.resetState(false, model, clone(model));
        }
      } else {
        handleVersion(this.getRawModel(), this.version);
      }
    } else {
      handleVersion(this.getRawModel(), this.version);
    }
    this.successMessage(msg);
    if (backOnSave) {
      this.back();
    }
  }
  protected successMessage(msg: string) {
    this.showMessage(msg);
  }
  protected fail(result: ResultInfo<T>): void {
    const errors = result.errors;
    const f = this.form;
    const u = this.ui;
    if (u) {
      const unmappedErrors = u.showFormError(f, errors);
      if (!result.message) {
        if (errors && errors.length === 1) {
          result.message = errors[0].message;
        } else {
          result.message = u.buildErrorMessage(unmappedErrors);
        }
      }
      focusFirstError(f);
    } else if (errors && errors.length === 1) {
      result.message = errors[0].message;
    }
    const t = this.resourceService.value('error');
    this.showError(result.message, t);
  }
  protected postSave(res: number|ResultInfo<T>, backOnSave: boolean): void {
    this.running = false;
    if (this.loading) {
      this.loading.hideLoading();
    }
    const newMod = this.newMode;
    const successMsg = (newMod ? this.insertSuccessMsg : this.updateSuccessMsg);
    const x: any = res;
    if (!isNaN(x)) {
      if (x > 0) {
        this.succeed(successMsg, backOnSave);
      } else {
        if (newMod) {
          this.handleDuplicateKey();
        } else {
          this.handleNotFound();
        }
      }
    } else {
      const result: ResultInfo<T> = x;
      if (result.status === Status.Success) {
        this.succeed(successMsg, backOnSave, result);
      } else if (result.status === Status.Error) {
        this.fail(result);
      } else if (newMod && result.status === Status.DuplicateKey) {
        this.handleDuplicateKey(result);
      } else {
        const msg = buildMessageFromStatusCode(result.status, this.resourceService);
        const r = this.resourceService;
        const title = r.value('error');
        if (msg && msg.length > 0) {
          this.showError(msg, title);
        } else if (result.message && result.message.length > 0) {
          this.showError(result.message, title);
        } else {
          this.showError(r.value('error_internal'), title);
        }
      }
    }
  }
  protected handleDuplicateKey(result?: ResultInfo<T>): void {
    const msg = message(this.resourceService, 'error_duplicate_key', 'error');
    this.showError(msg.message, msg.title);
  }
}
export class EditComponent<T, ID> extends BaseEditComponent<T, ID> implements OnInit {
  constructor(protected viewContainerRef: ViewContainerRef, protected route: ActivatedRoute, service: GenericService<T, ID, number|ResultInfo<T>>, param: ResourceService|EditParameter,
    showMessage?: (msg: string, option?: string) => void,
    showError?: (m: string, title?: string, detail?: string, callback?: () => void) => void,
    confirm?: (m2: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void,
    getLocale?: (profile?: string) => Locale,
    uis?: UIService,
    loading?: LoadingService, patchable?: boolean, backOnSaveSuccess?: boolean) {
    super(service, param, showMessage, showError, confirm, getLocale, uis, loading, patchable, backOnSaveSuccess);
    this.ngOnInit = this.ngOnInit.bind(this);
  }
  ngOnInit() {
    const fi = (this.ui ? this.ui.registerEvents : null);
    this.form = initElement(this.viewContainerRef, fi);
    const id: ID = buildId<ID>(this.route, this.keys);
    this.load(id);
  }
}

export interface SearchParameter {
  resource: ResourceService;
  showMessage: (msg: string, option?: string) => void;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  getLocale?: (profile?: string) => Locale;
  ui?: UIService;
  loading?: LoadingService;
}
export interface LocaleFormatter<T> {
  format(obj: T, locale: Locale): T;
}
export interface SearchModel {
  page?: number;
  limit: number;
  firstLimit?: number;
  fields?: string[];
  sort?: string;

  keyword?: string;
  excluding?: any;
  refId?: string|number;
}
export interface SearchResult<T> {
  total?: number;
  results: T[];
  last?: boolean;
}
export interface SearchService<T, S extends SearchModel> {
  search(s: S, ctx?: any): Promise<SearchResult<T>>;
  keys?(): string[];
}
export class BaseSearchComponent<T, S extends SearchModel> extends BaseComponent {
  constructor(sv: ((s: S, ctx?: any) => Promise<SearchResult<T>>) | SearchService<T, S>,
      param: ResourceService|SearchParameter,
      showMessage?: (msg: string, option?: string) => void,
      showError?: (m: string, header?: string, detail?: string, callback?: () => void) => void,
      getLocale?: (profile?: string) => Locale,
      uis?: UIService,
      loading?: LoadingService) {
    super(getResource(param), getLocaleFunc(param, getLocale), getUIService(param, uis), getLoadingFunc(param, loading));
    this.state = {} as any;

    if (sv) {
      if (typeof sv === 'function') {
        this.searchFn = sv;
      } else {
        this.service = sv;
        if (this.service.keys) {
          this.keys = this.service.keys();
        }
      }
    }
    this.ui = getUIService(param, uis);
    this.showError = getErrorFunc(param, showError);
    this.showMessage = getMsgFunc(param, showMessage);

    this.toggleFilter = this.toggleFilter.bind(this);
    this.mergeSearchModel = this.mergeSearchModel.bind(this);
    this.load = this.load.bind(this);
    this.getSearchForm = this.getSearchForm.bind(this);
    this.setSearchForm = this.setSearchForm.bind(this);

    this.setSearchModel = this.setSearchModel.bind(this);
    this.getOriginalSearchModel = this.getOriginalSearchModel.bind(this);
    this.getSearchModel = this.getSearchModel.bind(this);
    this.getDisplayFields = this.getDisplayFields.bind(this);

    this.pageSizeChanged = this.pageSizeChanged.bind(this);
    this.searchOnClick = this.searchOnClick.bind(this);

    this.resetAndSearch = this.resetAndSearch.bind(this);
    this.doSearch = this.doSearch.bind(this);
    this.search = this.search.bind(this);
    this.validateSearch = this.validateSearch.bind(this);
    this.showResults = this.showResults.bind(this);
    this.setList = this.setList.bind(this);
    this.getList = this.getList.bind(this);
    this.sort = this.sort.bind(this);
    this.showMore = this.showMore.bind(this);
    this.pageChanged = this.pageChanged.bind(this);
    const rs = this.resourceService;
    this.deleteHeader = rs.value('msg_delete_header');
    this.deleteConfirm = rs.value('msg_delete_confirm');
    this.deleteFailed = rs.value('msg_delete_failed');
    this.pageChanged = this.pageChanged.bind(this);
  }
  protected showMessage: (msg: string, option?: string) => void;
  protected showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  protected ui?: UIService;
  protected searchFn: (s: S, ctx?: any) => Promise<SearchResult<T>>;
  protected service: SearchService<T, S>;
  // Pagination
  initPageSize = 20;
  pageSize = 20;
  pageIndex = 1;
  itemTotal: number;
  pageTotal: number;
  showPaging: boolean;
  append: boolean;
  appendMode: boolean;
  appendable: boolean;
  // Sortable
  sortField: string;
  sortType: string;
  sortTarget: HTMLElement; // HTML element

  keys: string[];
  formatter: LocaleFormatter<T>;
  displayFields: string[];
  initDisplayFields: boolean;
  sequenceNo = 'sequenceNo';
  triggerSearch: boolean;
  tmpPageIndex: number;
  loadTime: Date;
  loadPage = 1;

  protected state: S;
  private list: T[];
  excluding: any;
  hideFilter: boolean;

  pageMaxSize = 7;
  pageSizes: number[] = [10, 20, 40, 60, 100, 200, 400, 1000];

  chkAll: HTMLInputElement;
  viewable = true;
  addable = true;
  editable = true;
  approvable = true;
  deletable = true;

  deleteHeader: string;
  deleteConfirm: string;
  deleteFailed: string;

  toggleFilter(event: any): void {
    this.hideFilter = !this.hideFilter;
  }
  mergeSearchModel(obj: S, arrs?: string[]|any, b?: S): S {
    return mergeSearchModel(obj, this.pageSizes, arrs, b);
  }
  load(s: S, autoSearch: boolean): void {
    this.loadTime = new Date();
    const obj2 = initSearchable(s, this);
    this.loadPage = this.pageIndex;
    this.setSearchModel(obj2);
    const com = this;
    if (autoSearch) {
      setTimeout(() => {
        com.doSearch(true);
      }, 0);
    }
  }
  protected getModelName(): string {
    return 'state';
  }
  protected setSearchForm(form: HTMLFormElement): void {
    this.form = form;
  }

  protected getSearchForm(): HTMLFormElement {
    return this.form;
  }

  setSearchModel(obj: S): void {
    this.state = obj;
  }

  getSearchModel(): S {
    let locale: Locale = enLocale;
    if (this.getLocale) {
      locale = this.getLocale();
    }
    let obj = this.state;
    if (this.ui) {
      const obj2 = this.ui.decodeFromForm(this.getSearchForm(), locale, this.getCurrencyCode());
      obj = obj2 ? obj2 : {};
    }
    const obj3 = optimizeSearchModel(obj, this, this.getDisplayFields());
    if (this.excluding) {
      obj3.excluding = this.excluding;
    }
    if (this.keys && this.keys.length === 1) {
      const l = this.getList();
      if (l && l.length > 0) {
        const refId = l[l.length - 1][this.keys[0]];
        if (refId) {
          obj3.refId = '' + refId;
        }
      }
    }
    return obj3;
  }
  getOriginalSearchModel(): S {
    return this.state;
  }

  protected getDisplayFields(): string[] {
    if (this.displayFields) {
      return this.displayFields;
    }
    if (!this.initDisplayFields) {
      if (this.getSearchForm()) {
        this.displayFields = getDisplayFields(this.getSearchForm());
      }
      this.initDisplayFields = true;
    }
    return this.displayFields;
  }
  onPageSizeChanged(event: Event): void {
    const ctrl = event.currentTarget as HTMLInputElement;
    this.pageSizeChanged(Number(ctrl.value), event);
  }
  pageSizeChanged(size: number, event?: Event): void {
    changePageSize(this, size);
    this.tmpPageIndex = 1;
    this.doSearch();
  }
  clearKeyworkOnClick = () => {
    this.state.keyword = '';
  }
  searchOnClick(event: Event): void {
    if (event && !this.getSearchForm()) {
      this.setSearchForm((event.currentTarget as HTMLInputElement).form);
    }
    this.resetAndSearch();
  }
  resetAndSearch() {
    if (this.running) {
      this.triggerSearch = true;
      return;
    }
    reset(this);
    this.tmpPageIndex = 1;
    this.doSearch();
  }
  doSearch(isFirstLoad?: boolean) {
    const listForm = this.getSearchForm();
    if (listForm && this.ui) {
      this.ui.removeFormError(listForm);
    }
    const s: S = this.getSearchModel();
    const com = this;
    this.validateSearch(s, () => {
      if (com.running) {
        return;
      }
      com.running = true;
      if (this.loading) {
        this.loading.showLoading();
      }
      addParametersIntoUrl(s, isFirstLoad);
      com.search(s);
    });
  }
  async search(se: S) {
    try {
      const ctx: any =  {};
      if (this.searchFn) {
        const sr = await this.searchFn(se, ctx);
        this.showResults(se, sr);
      } else {
        const result = await this.service.search(se, ctx);
        this.showResults(se, result);
      }
    } catch (err) {
      error(err, this.resourceService, this.showError);
    } finally {
      this.running = false;
      if (this.loading) {
        this.loading.hideLoading();
      }
    }
  }
  validateSearch(se: S, callback: () => void): void {
    let valid = true;
    const listForm = this.getSearchForm();
    if (listForm) {
      let locale: Locale = enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      if (this.ui) {
        valid = this.ui.validateForm(listForm, locale);
      }
    }
    if (valid === true) {
      callback();
    }
  }
  searchError(response: any): void {
    this.pageIndex = this.tmpPageIndex;
    error(response, this.resourceService, this.showError);
  }
  showResults(s: S, sr: SearchResult<T>): void {
    const com = this;
    const results = sr.results;
    if (results != null && results.length > 0) {
      let locale: Locale = enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      formatResults(results, this.formatter, locale, this.sequenceNo, this.pageIndex, this.pageSize, this.initPageSize);
    }
    const appendMode = com.appendMode;
    showResults(s, sr, com);
    if (!appendMode) {
      com.setList(results);
      com.tmpPageIndex = s.page;
      this.showMessage(buildSearchMessage(s, sr, this.resourceService));
    } else {
      if (this.append && s.page > 1) {
        append(this.getList(), results);
      } else {
        this.setList(results);
      }
    }
    this.running = false;
    if (this.loading) {
      this.loading.hideLoading();
    }
    if (this.triggerSearch) {
      this.triggerSearch = false;
      this.resetAndSearch();
    }
  }

  setList(results: T[]): void {
    this.list = results;
  }
  getList(): T[] {
    return this.list;
  }

  chkAllOnClick(event: Event, selected: string): void {
    const target = event.currentTarget as HTMLInputElement;
    const isChecked = target.checked;
    const list = this.getList();
    setAll(list, selected, isChecked);
    this.handleItemOnChecked(list);
  }
  itemOnClick(event: Event, selected: string): void {
    const list = this.getList();
    if (this.chkAll != null) {
      this.chkAll.checked = equalAll(list, selected, true);
    }
    this.handleItemOnChecked(list);
  }
  handleItemOnChecked(list: any[]) {
  }

  sort(event: Event): void {
    handleSortEvent(event, this);
    if (!this.appendMode) {
      this.doSearch();
    } else {
      this.resetAndSearch();
    }
  }

  showMore(event?: Event): void {
    this.tmpPageIndex = this.pageIndex;
    more(this);
    this.doSearch();
  }

  pageChanged(event?: any): void {
    if (this.loadTime) {
      const now = new Date();
      const d = Math.abs(this.loadTime.getTime() - now.getTime());
      if (d < 610) {
        if (event) {
          if (event.page && event.itemsPerPage && event.page !== this.loadPage) {
            changePage(this, this.loadPage, event.itemsPerPage);
          }
        }
        return;
      }
    }
    changePage(this, event.page, event.itemsPerPage);
    this.doSearch();
  }
}
export class SearchComponent<T, S extends SearchModel> extends BaseSearchComponent<T, S> implements OnInit {
  constructor(protected viewContainerRef: ViewContainerRef,
      sv: ((s: S, ctx?: any) => Promise<SearchResult<T>>) | SearchService<T, S>,
      param: ResourceService|SearchParameter,
      showMessage?: (msg: string, option?: string) => void,
      showError?: (m: string, header?: string, detail?: string, callback?: () => void) => void,
      getLocale?: (profile?: string) => Locale,
      uis?: UIService,
      loading?: LoadingService,
      autoSearch?: boolean) {
    super(sv, param, showMessage, showError, getLocale, uis, loading);
    if (autoSearch === false) {
      this.autoSearch = autoSearch;
    }
    this.ngOnInit = this.ngOnInit.bind(this);
  }
  protected autoSearch = true;
  ngOnInit() {
    const fi = (this.ui ? this.ui.registerEvents : null);
    this.form = initElement(this.viewContainerRef, fi);
    const s = this.mergeSearchModel(buildFromUrl<S>());
    this.load(s, this.autoSearch);
  }
}
